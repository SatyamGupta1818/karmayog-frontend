/**
 * module.service.ts
 *
 * CRUD operations for Modules (Menu Master).
 * Used by the Menu Master admin page to manage navigation modules.
 */

import client from '../../client';
import { API_URLS } from '../../api-url.service';

const moduleService = {
    /**
     * List all modules.
     */
    async list() {
        const { data } = await client.get(API_URLS.modules.list);
        return data;
    },

    /**
     * Get a single module by ID.
     */
    async getById(id) {
        const { data } = await client.get(API_URLS.modules.getById(id));
        return data;
    },

    /**
     * Create a new module.
     * @param {Object} payload - { name, key, path, icon, parentId?, sortOrder?, isActive? }
     */
    async create(payload) {
        const { data } = await client.post(API_URLS.modules.create, payload);
        return data;
    },

    /**
     * Update an existing module.
     * @param {string} id
     * @param {Object} payload - Partial module fields to update
     */
    async update(id, payload) {
        const { data } = await client.patch(API_URLS.modules.update(id), payload);
        return data;
    },

    /**
     * Delete a module.
     * @param {string} id
     */
    async delete(id) {
        const { data } = await client.delete(API_URLS.modules.delete(id));
        return data;
    },

    /**
     * Get permissions assigned to a module.
     * @param {string} moduleId
     */
    async getPermissions(moduleId) {
        const { data } = await client.get(API_URLS.modules.permissions(moduleId));
        return data;
    },

    /**
     * Assign permissions to a module.
     * @param {string} moduleId
     * @param {Object} payload - { permissionIds: string[] }
     */
    async assignPermissions(moduleId, payload) {
        const { data } = await client.put(API_URLS.modules.permissions(moduleId), payload);
        return data;
    },
};

export default moduleService;
