import client from '../../client';
import { API_URLS } from '../../api-url.service';

export interface FeatureListParams {
    page?: number;
    limit?: number;
    search?: string;
    projectId?: string;
    status?: string;
    priority?: string;
    ownerId?: string;
    orgId?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface FeaturePayload {
    name: string;
    description?: string;
    status?: string;
    priority?: string;
    projectId: string;
    ownerId?: string;
    startDate?: string;
    dueDate?: string;
    budgetMinutes?: number;
    orgId?: string;
    isActive?: boolean;
}

const featuresService = {
    async list(params?: FeatureListParams) {
        const { data } = await client.get(API_URLS.features.list, { params });
        return data;
    },

    async getById(id: string) {
        const { data } = await client.get(API_URLS.features.getById(id));
        return data;
    },

    async create(payload: FeaturePayload) {
        const { data } = await client.post(API_URLS.features.create, payload);
        return data;
    },

    async update(id: string, payload: Partial<FeaturePayload>) {
        const { data } = await client.patch(API_URLS.features.update(id), payload);
        return data;
    },

    async delete(id: string) {
        const { data } = await client.delete(API_URLS.features.delete(id));
        return data;
    },
};

export default featuresService;
