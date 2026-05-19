/**
 * rbac.service.ts
 *
 * Fetches the current user's permission manifest from the backend.
 * This is the single source of truth for what the logged-in user can access.
 */

import client from '../../client';
import { API_URLS } from '../../api-url.service';

const rbacService = {
    /**
     * Fetch the current user's permission manifest.
     * Returns { role: {...}, modules: [...] }
     */
    async fetchPermissionManifest() {
        const { data } = await client.get(API_URLS.rbac.myPermissions);
        return data;
    },
};

export default rbacService;
