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

    switchOrganization: `${AUTH}/switch-organization`,
} as const;


// ─── Users ────────────────────────────────────────────────────────────────────

const USERS = '/user';
export const USER_URLS = {
    create: `${USERS}/create`,

    list: `${USERS}/list`,

    getById: (id: string) => `${USERS}/${id}`,

    update: (id: string) => `${USERS}/update/${id}`,

    delete: (id: string) => `${USERS}/delete/${id}`,
} as const;

// ─── Organization ─────────────────────────────────────────────────────────────

const ORG = '/organization';
export const ORG_URLS = {
    create: `${ORG}/create`,

    list: `${ORG}/list`,

    getById: (id: string) => `${ORG}/${id}`,

    update: (id: string) => `${ORG}/update/${id}`,

    delete: (id: string) => `${ORG}/delete/${id}`,
} as const;

// ─── Projects ─────────────────────────────────────────────────────────────────

const PROJECTS = '/projects';
export const PROJECT_URLS = {
    create: `${PROJECTS}/create`,
    list: `${PROJECTS}/list`,
    getById: (id: string) => `${PROJECTS}/${id}`,
    update: (id: string) => `${PROJECTS}/update/${id}`,
    delete: (id: string) => `${PROJECTS}/delete/${id}`,
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

// ─── RBAC Base ────────────────────────────────────────────────────────────────

const RBAC = '/rbac';

// ─── Modules (Menu Master) ────────────────────────────────────────────────────

const MODULES = `${RBAC}/modules`;
export const MODULE_URLS = {
    list: MODULES,
    create: MODULES,
    getById: (id: string) => `${MODULES}/${id}`,
    update: (id: string) => `${MODULES}/${id}`,
    delete: (id: string) => `${MODULES}/${id}`,
    permissions: (id: string) => `${MODULES}/${id}/permissions`,
} as const;

// ─── Roles (Role Master) ─────────────────────────────────────────────────────

const ROLES = `${RBAC}/roles`;
export const ROLE_URLS = {
    list: ROLES,
    create: ROLES,
    getById: (id: string) => `${ROLES}/${id}`,
    update: (id: string) => `${ROLES}/${id}`,
    delete: (id: string) => `${ROLES}/${id}`,
    getPermissions: (id: string) => `${ROLES}/${id}/modules-permissions`,
    assignPermissions: (id: string) => `${ROLES}/${id}/permissions`,
} as const;

// ─── Permissions ──────────────────────────────────────────────────────────────

const PERMISSIONS = `${RBAC}/permissions`;
export const PERMISSION_URLS = {
    list: PERMISSIONS,
    create: PERMISSIONS,
    getById: (id: string) => `${PERMISSIONS}/${id}`,
    update: (id: string) => `${PERMISSIONS}/${id}`,
    delete: (id: string) => `${PERMISSIONS}/${id}`,
} as const;

// ─── RBAC (Permission Manifest) ──────────────────────────────────────────────

export const RBAC_URLS = {
    myPermissions: `${RBAC}/me/permissions`,
} as const;

// ─── Departments ──────────────────────────────────────────────────────────────

const DEPARTMENT = '/department';
export const DEPARTMENT_URLS = {
    create: `${DEPARTMENT}/create`,
    list: `${DEPARTMENT}/list`,
    getById: (id: string) => `${DEPARTMENT}/${id}`,
    update: (id: string) => `${DEPARTMENT}/update/${id}`,
    delete: (id: string) => `${DEPARTMENT}/delete/${id}`,
} as const;

// ─── Teams ────────────────────────────────────────────────────────────────────

const TEAMS = '/teams';
export const TEAM_URLS = {
    create: `${TEAMS}/create`,
    list: `${TEAMS}/list`,
    getById: (id: string) => `${TEAMS}/${id}`,
    update: (id: string) => `${TEAMS}/update/${id}`,
    delete: (id: string) => `${TEAMS}/delete/${id}`,
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
    modules: MODULE_URLS,
    roles: ROLE_URLS,
    permissions: PERMISSION_URLS,
    rbac: RBAC_URLS,
    departments: DEPARTMENT_URLS,
    teams: TEAM_URLS,
} as const;
