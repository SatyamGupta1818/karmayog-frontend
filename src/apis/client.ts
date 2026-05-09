import axios, {
    AxiosError,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';

import { API_BASE_URL, API_URLS } from './api-url.service';

// ─── Token Storage ────────────────────────────────────────────────────────────

const TOKEN_KEYS = {
    access: 'access_token',
    refresh: 'refresh_token',
} as const;

export const tokenStorage = {
    getAccess: () => localStorage.getItem(TOKEN_KEYS.access),
    getRefresh: () => localStorage.getItem(TOKEN_KEYS.refresh),
    setAccess: (t: string) => localStorage.setItem(TOKEN_KEYS.access, t),
    setRefresh: (t: string) => localStorage.setItem(TOKEN_KEYS.refresh, t),
    setTokens: (a: string, r: string) => {
        localStorage.setItem(TOKEN_KEYS.access, a);
        localStorage.setItem(TOKEN_KEYS.refresh, r);
    },
    clearAll: () => {
        localStorage.removeItem(TOKEN_KEYS.access);
        localStorage.removeItem(TOKEN_KEYS.refresh);
    },
};

// ─── Axios Instance ───────────────────────────────────────────────────────────

const client = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15_000,
});

// ─── Request Interceptor — Attach Access Token ────────────────────────────────

client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenStorage.getAccess();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ─── Refresh State ─────────────────────────────────────────────────────────────
//
//  Prevents a "refresh storm": if 3 requests all get 401 at the same time,
//  only ONE refresh call is made. The other 2 are queued and retried with
//  the new access token once the refresh resolves.
//

type QueueItem = {
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null) => {
    failedQueue.forEach((item) => {
        if (error) {
            item.reject(error);
        } else {
            item.resolve(token!);
        }
    });
    failedQueue = [];
};

// ─── Response Interceptor — Silent Refresh on 401 ────────────────────────────

client.interceptors.response.use(
    (response: AxiosResponse) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        const status = error.response?.status;

        // ── Not a 401, or already retried, or this IS the refresh call ───────────
        const isRefreshEndpoint = originalRequest?.url?.includes(API_URLS.auth.refresh);

        if (status !== 401 || originalRequest._retry || isRefreshEndpoint) {
            return Promise.reject(error);
        }

        // ── Another refresh is already in flight — queue this request ─────────────
        if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((newAccessToken) => {
                    originalRequest.headers!.Authorization = `Bearer ${newAccessToken}`;
                    return client(originalRequest);
                })
                .catch(Promise.reject.bind(Promise));
        }

        // ── Start the refresh ─────────────────────────────────────────────────────
        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = tokenStorage.getRefresh();

        if (!refreshToken) {
            // No refresh token at all — log the user out immediately
            isRefreshing = false;
            processQueue(error, null);
            handleHardLogout();
            return Promise.reject(error);
        }

        try {
            // Use a plain axios call (NOT the client) to avoid infinite interceptor loop
            const { data } = await axios.post<{
                accessToken: string;
                refreshToken: string;
            }>(
                `${API_BASE_URL}${API_URLS.auth.refresh}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${refreshToken}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            const { accessToken, refreshToken: newRefreshToken } = data;

            // Store the new token pair (rotation)
            tokenStorage.setTokens(accessToken, newRefreshToken);

            // Update the Authorization header on the client defaults too
            client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            // Flush all queued requests with the new token
            processQueue(null, accessToken);

            // Retry the original failed request
            originalRequest.headers!.Authorization = `Bearer ${accessToken}`;
            return client(originalRequest);

        } catch (refreshError) {
            // Refresh itself failed (e.g. 403 — token revoked or rotated)
            processQueue(refreshError, null);
            handleHardLogout();
            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    },
);

// ─── Hard Logout ──────────────────────────────────────────────────────────────
//
//  Called when the refresh token is missing or rejected.
//  Clears storage and redirects to /auth.
//  Uses window.location instead of React Router to work outside component tree.
//

function handleHardLogout(): void {
    tokenStorage.clearAll();

    // Avoid redirect loop if already on /auth
    if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth';
    }
}

export default client;