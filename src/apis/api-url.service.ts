export const API_BASE_URL = 'http://localhost:3000/api/v1';

const AUTH = '/auth';
export const AUTH_URLS = {
    requestOtp: `${AUTH}/request-otp`,

    verifyOtp: `${AUTH}/verify-otp`,

    resendOtp: `${AUTH}/resend-otp`,

    refresh: `${AUTH}/refresh`,

    logout: `${AUTH}/logout`,

    me: `${AUTH}/me`,

    register: `${AUTH}/register`,
} as const;


// ─── Users ────────────────────────────────────────────────────────────────────

const USERS = '/users';
export const USER_URLS = {
    list: USERS,

    getById: (id: string) => `${USERS}/${id}`,

    update: (id: string) => `${USERS}/${id}`,

    delete: (id: string) => `${USERS}/${id}`,

    updateRole: (id: string) => `${USERS}/${id}/role`,
} as const;

// ─── Organization ─────────────────────────────────────────────────────────────

const ORG = '/organization';
export const ORG_URLS = {
    me: `${ORG}/me`,

    update: ORG,

    members: `${ORG}/members`,

    invite: `${ORG}/invite`,

    removeMember: (userId: string) => `${ORG}/members/${userId}`,
} as const;

// ─── Projects ─────────────────────────────────────────────────────────────────

const PROJECTS = '/projects';
export const PROJECT_URLS = {
    list: PROJECTS,
    create: PROJECTS,
    getById: (id: string) => `${PROJECTS}/${id}`,
    update: (id: string) => `${PROJECTS}/${id}`,
    delete: (id: string) => `${PROJECTS}/${id}`,
    members: (id: string) => `${PROJECTS}/${id}/members`,
} as const;

// ─── Tasks ────────────────────────────────────────────────────────────────────

const TASKS = '/tasks';
export const TASK_URLS = {
    list: TASKS,
    create: TASKS,
    getById: (id: string) => `${TASKS}/${id}`,
    update: (id: string) => `${TASKS}/${id}`,
    delete: (id: string) => `${TASKS}/${id}`,
    updateStatus: (id: string) => `${TASKS}/${id}/status`,
    byProject: (projectId: string) => `${PROJECTS}/${projectId}/tasks`,
} as const;

// ─── Master export ────────────────────────────────────────────────────────────

/**
 * Grouped API URL registry.
 *
 * @example
 *   import { API_URLS } from '@/services/api-url.service'
 *   client.post(API_URLS.auth.requestOtp, { email })
 *   client.get(API_URLS.users.getById(userId))
 */
export const API_URLS = {
    auth: AUTH_URLS,
    users: USER_URLS,
    org: ORG_URLS,
    projects: PROJECT_URLS,
    tasks: TASK_URLS,
} as const;