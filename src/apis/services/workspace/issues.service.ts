import client from '../../client';
import { API_URLS } from '../../api-url.service';

export interface IssueListParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    priority?: string;
    severity?: string;
    projectId?: string;
    featureId?: string;
    taskId?: string;
    subTaskId?: string;
    assignedToId?: string;
    orgId?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface IssuePayload {
    title: string;
    description?: string;
    type?: string;
    status?: string;
    priority?: string;
    severity?: string;
    projectId?: string;
    featureId?: string;
    taskId?: string;
    subTaskId?: string;
    assignedToId?: string;
    startDate?: string;
    dueDate?: string;
    budgetMinutes?: number;
    resolution?: string;
    orgId?: string;
    isActive?: boolean;
}

const issuesService = {
    async list(params?: IssueListParams) {
        const { data } = await client.get(API_URLS.issues.list, { params });
        return data;
    },

    async getById(id: string) {
        const { data } = await client.get(API_URLS.issues.getById(id));
        return data;
    },

    async create(payload: IssuePayload) {
        const { data } = await client.post(API_URLS.issues.create, payload);
        return data;
    },

    async update(id: string, payload: Partial<IssuePayload>) {
        const { data } = await client.patch(API_URLS.issues.update(id), payload);
        return data;
    },

    async delete(id: string) {
        const { data } = await client.delete(API_URLS.issues.delete(id));
        return data;
    },
};

export default issuesService;
