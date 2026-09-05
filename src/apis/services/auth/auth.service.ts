import client, { tokenStorage } from '../../client';
import { API_URLS } from '../../api-url.service';


export interface RequestOtpPayload {
    email: string;
}

export interface VerifyOtpPayload {
    email: string;
    otp: string;
}

export interface ResendOtpPayload {
    email: string;
}

export type OrganizationType =
    | 'startup'
    | 'sme'
    | 'enterprise'
    | 'non_profit'
    | 'government'
    | 'other';

export type OrganizationSize =
    | '1-10'
    | '11-50'
    | '51-200'
    | '201-1000'
    | '1000+';

export interface RegisterOrgPayload {
    firstName: string;
    lastName: string;
    workEmail: string;
    mobileNo: string;
    designation: string;
    organizationName: string;
    organizationType: OrganizationType;
    organizationSize: OrganizationSize;
    orgEmail: string;
}

export interface MessageResponse {
    message: string;
}

export interface TokensResponse {
    accessToken: string;
    refreshToken: string;
}

export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNo: string;
    designation: string;
    isActive: boolean;
    createdAt: string;
}

export interface LoginResponse extends TokensResponse {
    user: UserProfile;
}

interface ApiResponse<T> {
    data: T;
}

export interface RegisterOrgResponse {
    message: string;
    data: {
        organization: {
            id: string;
            organizationName: string;
            organizationType: string;
            organizationSize: string;
            orgEmail: string;
            createdAt: string;
        };
        user: UserProfile;
    };
}


export function getErrorMessage(error: unknown): string {
    if (
        error &&
        typeof error === 'object' &&
        'response' in error
    ) {
        const axiosErr = error as { response?: { data?: { message?: string | string[] } } };
        const msg = axiosErr.response?.data?.message;
        if (Array.isArray(msg)) return msg.join(', ');
        if (typeof msg === 'string') return msg;
    }
    if (error instanceof Error) return error.message;
    return 'Something went wrong. Please try again.';
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

const authService = {
    async requestOtp(payload: RequestOtpPayload): Promise<MessageResponse> {
        const { data } = await client.post<MessageResponse>(
            API_URLS.auth.requestOtp,
            payload,
        );
        return data;
    },

    async verifyOtp(payload: VerifyOtpPayload): Promise<LoginResponse> {
        const { data: response } = await client.post<LoginResponse | ApiResponse<LoginResponse>>(
            API_URLS.auth.verifyOtp,
            payload,
        );
        const data = 'data' in response ? response.data : response;

        tokenStorage.setTokens(data.accessToken, data.refreshToken);
        tokenStorage.setUser(JSON.stringify(data.user));

        const organization =
            (data as any).organization ||
            (data as any).activeOrganization ||
            (data as any).org ||
            (data as any).data?.organization ||
            (data as any).user?.organization ||
            (data as any).user?.activeOrganization;

        if (organization) {
            localStorage.setItem('organization', JSON.stringify(organization));
        }


        return data;
    },

    async resendOtp(payload: ResendOtpPayload): Promise<MessageResponse> {
        const { data } = await client.post<MessageResponse>(
            API_URLS.auth.resendOtp,
            payload,
        );
        return data;
    },

    async refreshTokens(): Promise<TokensResponse> {
        const refreshToken = tokenStorage.getRefresh();

        const { data } = await client.post<TokensResponse>(
            API_URLS.auth.refresh,
            {},
            {
                headers: {
                    Authorization: `Bearer ${refreshToken}`,
                },
            },
        );

        tokenStorage.setTokens(data.accessToken, data.refreshToken);
        return data;
    },
    async logout(): Promise<void> {
        try {
            await client.post<MessageResponse>(API_URLS.auth.logout);
        } finally {
            // Always clear local tokens, even if the server call fails
            tokenStorage.clearAll();
        }
    },

    async getProfile(): Promise<UserProfile> {
        const { data: response } = await client.get<UserProfile | ApiResponse<UserProfile>>(
            API_URLS.auth.me,
        );
        return 'data' in response ? response.data : response;
    },

    async registerOrganization(
        payload: RegisterOrgPayload,
    ): Promise<RegisterOrgResponse> {
        const { data } = await client.post<RegisterOrgResponse>(
            API_URLS.auth.register,
            payload,
        );
        return data;
    },

    isAuthenticated(): boolean {
        return Boolean(tokenStorage.getAccess());
    },
};

export default authService;
