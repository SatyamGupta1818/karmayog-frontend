import client from '../../client';
import { API_URLS } from '../../api-url.service';

export interface WorkLogListParams {
    page?: number;
    limit?: number;
    projectId?: string;
    featureId?: string;
    taskId?: string;
    subTaskId?: string;
    issueId?: string;
    targetType?: 'TASK' | 'SUB_TASK' | 'ISSUE';
    targetId?: string;
    userId?: string;
    fromDate?: string;
    toDate?: string;
    orgId?: string;
}

export interface WorkLogPayload {
    targetType: 'TASK' | 'SUB_TASK' | 'ISSUE';
    targetId: string;
    logDate: string;
    minutesSpent: number;
    description?: string;
    userId?: string;
    orgId?: string;
}

export interface WorkLogReportParams {
    date?: string;
    projectId?: string;
    userId?: string;
    orgId?: string;
}

const workLogsService = {
    async list(params?: WorkLogListParams) {
        const { data } = await client.get(API_URLS.workLogs.list, { params });
        return data;
    },

    async getById(id: string) {
        const { data } = await client.get(API_URLS.workLogs.getById(id));
        return data;
    },

    async create(payload: WorkLogPayload) {
        const { data } = await client.post(API_URLS.workLogs.create, payload);
        return data;
    },

    async update(id: string, payload: Partial<WorkLogPayload>) {
        const { data } = await client.patch(API_URLS.workLogs.update(id), payload);
        return data;
    },

    async delete(id: string) {
        const { data } = await client.delete(API_URLS.workLogs.delete(id));
        return data;
    },

    async daily(params?: WorkLogReportParams) {
        const { data } = await client.get(API_URLS.workLogs.daily, { params });
        return data;
    },

    async weekly(params?: WorkLogReportParams) {
        const { data } = await client.get(API_URLS.workLogs.weekly, { params });
        return data;
    },

    async monthly(params?: WorkLogReportParams) {
        const { data } = await client.get(API_URLS.workLogs.monthly, { params });
        return data;
    },
};

export default workLogsService;
