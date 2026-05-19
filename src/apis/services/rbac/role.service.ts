/**
 * role.service.ts
 *
 * CRUD operations for Roles + Permission assignment.
 * Used by the Role Master admin page.
 */

import client from '../../client';
import { API_URLS } from '../../api-url.service';

const roleService = {
    /**
     * List all roles.
     */
    async list() {
        const { data } = await client.get(API_URLS.roles.list);
        return data;
    },

    /**
     * Get a single role by ID.
     */
    async getById(id) {
        const { data } = await client.get(API_URLS.roles.getById(id));
        return data;
    },

    /**
     * Create a new role.
     * @param {Object} payload - { name, description }
     */
    async create(payload) {
        const { data } = await client.post(API_URLS.roles.create, payload);
        return data;
    },

    /**
     * Update an existing role.
     * @param {string} id
     * @param {Object} payload - { name?, description?, isActive? }
     */
    async update(id, payload) {
        const { data } = await client.patch(API_URLS.roles.update(id), payload);
        return data;
    },

    /**
     * Delete a role.
     * @param {string} id
     */
    async delete(id) {
        const { data } = await client.delete(API_URLS.roles.delete(id));
        return data;
    },

    /**
     * List all available permissions (global).
     */
    async listPermissions() {
        const { data } = await client.get(API_URLS.permissions.list);
        return data;
    },

    /**
     * Get permissions assigned to a specific role.
     * Returns modules with their permission checkboxes.
     * @param {string} roleId
     */
    async getRolePermissions(roleId) {
        const { data } = await client.get(API_URLS.roles.getPermissions(roleId));
        return data;
    },

    /**
     * Assign permissions to a role.
     * @param {string} roleId
     * @param {Object} payload - { permissions: [{ modulePermissionId, allowed }] }
     */
    async assignPermissions(roleId, payload) {
        const { data } = await client.put(
            API_URLS.roles.assignPermissions(roleId),
            payload,
        );
        return data;
    },
};

export default roleService;
