/**
 * projects.service.ts
 *
 * Project operations for the KARMAYOG platform.
 */

import client from '../../client';
import { API_URLS } from '../../api-url.service';

export interface ProjectListParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface ProjectPayload {
    name: string;
    description?: string;
    status?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    budgetMinutes?: number;
    departmentId?: string;
    teamIds?: string[];
    memberIds?: string[];
    orgId?: string;
}

const projectsService = {
    /**
     * List projects
     */
    async list(params?: ProjectListParams) {
        const { data } = await client.get(API_URLS.projects.list, { params });
        return data;
    },

    /**
     * Get a single project by ID
     */
    async getById(id: string) {
        const { data } = await client.get(API_URLS.projects.getById(id));
        return data;
    },

    /**
     * Create a new project
     */
    async create(payload: ProjectPayload) {
        const { data } = await client.post(API_URLS.projects.create, payload);
        return data;
    },

    /**
     * Update a project
     */
    async update(id: string, payload: Partial<ProjectPayload>) {
        const { data } = await client.patch(API_URLS.projects.update(id), payload);
        return data;
    },

    /**
     * Delete a project
     */
    async delete(id: string) {
        const { data } = await client.delete(API_URLS.projects.delete(id));
        return data;
    }
};

export default projectsService;
