/**
 * permission.service.ts
 *
 * CRUD operations for Permissions (Permission Master).
 * Used by the Permission Master admin page to manage the global pool of permissions.
 */

import client from '../../client';
import { API_URLS } from '../../api-url.service';

const permissionService = {
    /**
     * List all permissions.
     */
    async list() {
        const { data } = await client.get(API_URLS.permissions.list);
        return data;
    },

    /**
     * Get a single permission by ID.
     */
    async getById(id) {
        const { data } = await client.get(API_URLS.permissions.getById(id));
        return data;
    },

    /**
     * Create a new permission.
     * @param {Object} payload - { name, key, description? }
     */
    async create(payload) {
        const { data } = await client.post(API_URLS.permissions.create, payload);
        return data;
    },

    /**
     * Update an existing permission.
     * @param {string} id
     * @param {Object} payload - Partial permission fields to update
     */
    async update(id, payload) {
        const { data } = await client.patch(API_URLS.permissions.update(id), payload);
        return data;
    },

    /**
     * Delete a permission.
     * @param {string} id
     */
    async delete(id) {
        const { data } = await client.delete(API_URLS.permissions.delete(id));
        return data;
    },
};

export default permissionService;
