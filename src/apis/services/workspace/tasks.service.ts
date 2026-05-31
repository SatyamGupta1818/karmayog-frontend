import client from '../../client';
import { API_URLS } from '../../api-url.service';

export interface TaskListParams {
    page?: number;
    limit?: number;
    search?: string;
    projectId?: string;
    featureId?: string;
    status?: string;
    priority?: string;
    assignedToId?: string;
    orgId?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface TaskPayload {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    featureId: string;
    assignedToId?: string;
    startDate?: string;
    dueDate?: string;
    budgetMinutes?: number;
    orgId?: string;
    isActive?: boolean;
}

const tasksService = {
    async list(params?: TaskListParams) {
        const { data } = await client.get(API_URLS.tasks.list, { params });
        return data;
    },

    async getById(id: string) {
        const { data } = await client.get(API_URLS.tasks.getById(id));
        return data;
    },

    async create(payload: TaskPayload) {
        const { data } = await client.post(API_URLS.tasks.create, payload);
        return data;
    },

    async update(id: string, payload: Partial<TaskPayload>) {
        const { data } = await client.patch(API_URLS.tasks.update(id), payload);
        return data;
    },

    async delete(id: string) {
        const { data } = await client.delete(API_URLS.tasks.delete(id));
        return data;
    },
};

export default tasksService;
