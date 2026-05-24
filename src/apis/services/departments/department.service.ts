/**
 * department.service.ts
 *
 * CRUD operations for Departments.
 * Mirrors the backend endpoints:
 *   POST   /department/create
 *   GET    /department/list?page=&limit=&search=&isActive=&sortBy=&sortOrder=
 *   GET    /department/:id
 *   PATCH  /department/update/:id
 *   DELETE /department/delete/:id
 */

import client from '../../client';
import { API_URLS } from '../../api-url.service';

export interface DepartmentListParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

const departmentService = {
    /**
     * List departments with optional pagination, search, and sorting.
     */
    async list(params?: DepartmentListParams) {
        const { data } = await client.get(API_URLS.departments.list, { params });
        return data;
    },

    /**
     * Get a single department by ID.
     */
    async getById(id: string) {
        const { data } = await client.get(API_URLS.departments.getById(id));
        return data;
    },

    /**
     * Create a new department.
     * @param payload - { name, description?, isActive? }
     */
    async create(payload: { name: string; description?: string; isActive?: boolean }) {
        const { data } = await client.post(API_URLS.departments.create, payload);
        return data;
    },

    /**
     * Update an existing department.
     * @param id - Department ID
     * @param payload - Partial department fields to update
     */
    async update(id: string, payload: Partial<{ name: string; description: string; isActive: boolean }>) {
        const { data } = await client.patch(API_URLS.departments.update(id), payload);
        return data;
    },

    /**
     * Delete a department.
     */
    async delete(id: string) {
        const { data } = await client.delete(API_URLS.departments.delete(id));
        return data;
    },
};

export default departmentService;
