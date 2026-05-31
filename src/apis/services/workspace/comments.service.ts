import client from '../../client';
import { API_URLS } from '../../api-url.service';

export interface CommentListParams {
    page?: number;
    limit?: number;
    targetType?: 'PROJECT' | 'FEATURE' | 'TASK' | 'SUB_TASK' | 'ISSUE';
    targetId?: string;
    projectId?: string;
    createdById?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    orgId?: string;
}

export interface CommentPayload {
    body: string;
    targetType: 'PROJECT' | 'FEATURE' | 'TASK' | 'SUB_TASK' | 'ISSUE';
    targetId: string;
    orgId?: string;
}

const commentsService = {
    async list(params?: CommentListParams) {
        const { data } = await client.get(API_URLS.comments.list, { params });
        return data;
    },

    async getById(id: string) {
        const { data } = await client.get(API_URLS.comments.getById(id));
        return data;
    },

    async create(payload: CommentPayload) {
        const { data } = await client.post(API_URLS.comments.create, payload);
        return data;
    },

    async update(id: string, payload: Partial<CommentPayload>) {
        const { data } = await client.patch(API_URLS.comments.update(id), payload);
        return data;
    },

    async delete(id: string) {
        const { data } = await client.delete(API_URLS.comments.delete(id));
        return data;
    },
};

export default commentsService;
