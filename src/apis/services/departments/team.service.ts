/**
 * team.service.ts
 *
 * CRUD operations for Teams.
 * Mirrors the backend endpoints:
 *   POST   /teams/create
 *   GET    /teams/list?page=&limit=&search=&departmentId=&isActive=&sortBy=&sortOrder=
 *   GET    /teams/:id
 *   PATCH  /teams/update/:id
 *   DELETE /teams/delete/:id
 */

import client from '../../client';
import { API_URLS } from '../../api-url.service';

export interface TeamListParams {
    page?: number;
    limit?: number;
    search?: string;
    departmentId?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

const teamService = {
    /**
     * List teams with optional pagination, search, filtering, and sorting.
     */
    async list(params?: TeamListParams) {
        const { data } = await client.get(API_URLS.teams.list, { params });
        return data;
    },

    /**
     * Get a single team by ID.
     */
    async getById(id: string) {
        const { data } = await client.get(API_URLS.teams.getById(id));
        return data;
    },

    /**
     * Create a new team.
     * @param payload - { departmentId, name, description?, isActive? }
     */
    async create(payload: { departmentId: string; name: string; description?: string; isActive?: boolean }) {
        const { data } = await client.post(API_URLS.teams.create, payload);
        return data;
    },

    /**
     * Update an existing team.
     * @param id - Team ID
     * @param payload - Partial team fields to update
     */
    async update(id: string, payload: Partial<{ name: string; description: string; isActive: boolean }>) {
        const { data } = await client.patch(API_URLS.teams.update(id), payload);
        return data;
    },

    /**
     * Delete a team.
     */
    async delete(id: string) {
        const { data } = await client.delete(API_URLS.teams.delete(id));
        return data;
    },
};

export default teamService;
