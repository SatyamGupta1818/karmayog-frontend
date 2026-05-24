/**
 * organization.service.ts
 *
 * Organization operations used by the app shell and Super Admin workspace.
 * Mirrors the backend organization module endpoints:
 *   POST   /organization/create
 *   GET    /organization/list
 *   GET    /organization/:id
 *   PATCH  /organization/update/:id
 *   DELETE /organization/delete/:id
 * Tenant switching is exposed by auth:
 *   POST   /auth/switch-organization { orgId }
 */

import client, { tokenStorage } from '../../client';
import { API_URLS } from '../../api-url.service';

export interface OrganizationListParams {
    page?: number;
    limit?: number;
    search?: string;
    subscriptionType?: 'FREE' | 'PRO' | 'PREMIUM';
    isSubscriptionTaken?: boolean;
    isActive?: boolean;
    sortBy?: 'organizationName' | 'organizationType' | 'organizationSize' | 'orgEmail' | 'subscriptionType' | 'isSubscriptionTaken' | 'isActive' | 'createdAt' | 'updatedAt';
    sortOrder?: 'ASC' | 'DESC';
}

export interface OrganizationPayload {
    organizationName: string;
    organizationType: string;
    organizationSize: string;
    orgEmail?: string;
    website?: string;
    subscriptionType?: 'FREE' | 'PRO' | 'PREMIUM';
    isSubscriptionTaken?: boolean;
    isActive?: boolean;
}

const organizationService = {
    /**
     * Get the active organization through the authenticated profile.
     */
    async getCurrent() {
        const { data } = await client.get(API_URLS.auth.me);
        persistProfile(data);
        return data;
    },

    /**
     * List organizations. SUPER_ADMIN receives all organizations; other roles
     * are scoped by the backend to their active organization.
     */
    async list(params?: OrganizationListParams) {
        const { data } = await client.get(API_URLS.org.list, { params });
        return data;
    },

    /**
     * Get a single organization by ID.
     */
    async getById(id: string) {
        const { data } = await client.get(API_URLS.org.getById(id));
        return data;
    },

    /**
     * Create a new organization.
     */
    async create(payload: OrganizationPayload) {
        const { data } = await client.post(API_URLS.org.create, payload);
        return data;
    },

    /**
     * Update an organization.
     */
    async update(id: string, payload: Partial<OrganizationPayload>) {
        const { data } = await client.patch(API_URLS.org.update(id), payload);
        return data;
    },

    /**
     * Soft-delete an organization.
     */
    async delete(id: string) {
        const { data } = await client.delete(API_URLS.org.delete(id));
        return data;
    },

    /**
     * Switch SUPER_ADMIN active organization and refresh the local profile.
     */
    async switchOrganization(orgId: string) {
        const { data } = await client.post(API_URLS.auth.switchOrganization, { orgId });
        persistSwitchResponse(data);

        try {
            const { data: profile } = await client.get(API_URLS.auth.me);
            persistProfile(profile);
            return {
                ...data,
                user: profile,
                organization: extractOrganization(profile),
            };
        } catch {
            return data;
        }
    },
};

function persistProfile(profile: any) {
    if (!profile || typeof profile !== 'object') return;

    tokenStorage.setUser(JSON.stringify(profile));

    const organization = extractOrganization(profile);
    if (organization) {
        localStorage.setItem('organization', JSON.stringify(organization));
    }
}

function extractOrganization(value: any) {
    if (!value || typeof value !== 'object') return null;

    return (
        value.organization ||
        value.activeOrganization ||
        value.org ||
        value.data?.organization ||
        value.data?.activeOrganization ||
        value.data?.org ||
        value.user?.organization ||
        value.user?.activeOrganization ||
        null
    );
}

function persistSwitchResponse(response: any) {
    const payload = response?.data || response || {};
    const accessToken = payload.accessToken || payload.tokens?.accessToken;
    const refreshToken = payload.refreshToken || payload.tokens?.refreshToken;
    const user = payload.user || payload.currentUser;
    const organization = extractOrganization(payload);

    if (accessToken && refreshToken) {
        tokenStorage.setTokens(accessToken, refreshToken);
    } else {
        if (accessToken) {
            tokenStorage.setAccess(accessToken);
        }
        if (refreshToken) {
            tokenStorage.setRefresh(refreshToken);
        }
    }

    if (user) {
        tokenStorage.setUser(JSON.stringify(user));
    }

    if (organization) {
        localStorage.setItem('organization', JSON.stringify(organization));
    }
}

export default organizationService;
