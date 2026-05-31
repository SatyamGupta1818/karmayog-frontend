import client from '../../client';
import { API_URLS } from '../../api-url.service';

export interface SubTaskListParams {
    page?: number;
    limit?: number;
    search?: string;
    projectId?: string;
    featureId?: string;
    taskId?: string;
    status?: string;
    priority?: string;
    assignedToId?: string;
    orgId?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface SubTaskPayload {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    taskId: string;
    assignedToId?: string;
    startDate?: string;
    dueDate?: string;
    budgetMinutes?: number;
    orgId?: string;
    isActive?: boolean;
}

const subtasksService = {
    async list(params?: SubTaskListParams) {
        const { data } = await client.get(API_URLS.subtasks.list, { params });
        return data;
    },

    async getById(id: string) {
        const { data } = await client.get(API_URLS.subtasks.getById(id));
        return data;
    },

    async create(payload: SubTaskPayload) {
        const { data } = await client.post(API_URLS.subtasks.create, payload);
        return data;
    },

    async update(id: string, payload: Partial<SubTaskPayload>) {
        const { data } = await client.patch(API_URLS.subtasks.update(id), payload);
        return data;
    },

    async delete(id: string) {
        const { data } = await client.delete(API_URLS.subtasks.delete(id));
        return data;
    },
};

export default subtasksService;
