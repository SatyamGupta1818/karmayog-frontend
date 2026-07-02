import client from '../../client';
import { API_URLS } from '../../api-url.service';

type WorkLogTargetType = 'TASK' | 'SUB_TASK' | 'ISSUE';
type WorkLogReportPeriod = 'daily' | 'weekly' | 'monthly';
type AnyRecord = Record<string, any>;

const REPORT_PAGE_SIZE = 500;
const REPORT_PARAM_KEYS = ['date', 'projectId', 'userId', 'orgId'] as const;
const REPORT_ENDPOINTS: Record<WorkLogReportPeriod, string> = {
    daily: API_URLS.workLogs.daily,
    weekly: API_URLS.workLogs.weekly,
    monthly: API_URLS.workLogs.monthly,
};

export interface WorkLogListParams {
    page?: number;
    limit?: number;
    projectId?: string;
    featureId?: string;
    taskId?: string;
    subTaskId?: string;
    issueId?: string;
    targetType?: WorkLogTargetType;
    targetId?: string;
    userId?: string;
    fromDate?: string;
    toDate?: string;
    orgId?: string;
}

export interface WorkLogPayload {
    targetType: WorkLogTargetType;
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

export interface WorkLogUserRelation {
    id?: string;
    uuid?: string;
    userId?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    [key: string]: any;
}

export interface WorkLogRecord {
    id: string;
    targetType: WorkLogTargetType | string;
    targetId: string;
    logDate: string;
    minutesSpent: number;
    description?: string | null;
    userId?: string | null;
    projectId?: string | null;
    featureId?: string | null;
    taskId?: string | null;
    subTaskId?: string | null;
    issueId?: string | null;
    user?: WorkLogUserRelation | null;
    [key: string]: any;
}

export interface WorkLogSummaryItem {
    projectId?: string | null;
    userId?: string | null;
    targetType?: WorkLogTargetType | string | null;
    totalMinutes?: number;
    totalHours?: number;
    [key: string]: any;
}

export interface WorkLogReportResponse {
    period: WorkLogReportPeriod | string;
    startDate: string;
    endDate: string;
    totalMinutes: number;
    totalHours: number;
    summaryItems: WorkLogSummaryItem[];
    workLogs: WorkLogRecord[];
    [key: string]: any;
}

function isRecord(value: unknown): value is AnyRecord {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function toDateOnly(date: Date) {
    return date.toISOString().slice(0, 10);
}

function getEntityId(entity: AnyRecord | null | undefined, extraKeys: string[] = []) {
    if (!entity) return '';

    const keys = [
        ...extraKeys,
        'id',
        'uuid',
        '_id',
        'workLogId',
        'userId',
        'projectId',
        'featureId',
        'taskId',
        'subTaskId',
        'issueId',
    ];

    const value = keys
        .map((key) => entity[key])
        .find((candidate) => candidate !== undefined && candidate !== null && candidate !== '');

    return value !== undefined && value !== null ? String(value) : '';
}

function getReportDateRange(period: WorkLogReportPeriod, value?: string) {
    const anchor = value ? new Date(`${value}T00:00:00.000Z`) : new Date();
    const safeAnchor = Number.isNaN(anchor.getTime()) ? new Date() : anchor;
    const start = new Date(Date.UTC(
        safeAnchor.getUTCFullYear(),
        safeAnchor.getUTCMonth(),
        safeAnchor.getUTCDate(),
    ));
    const end = new Date(start);

    if (period === 'weekly') {
        const day = start.getUTCDay();
        const daysSinceMonday = (day + 6) % 7;
        start.setUTCDate(start.getUTCDate() - daysSinceMonday);
        end.setUTCDate(start.getUTCDate() + 6);
    }

    if (period === 'monthly') {
        start.setUTCDate(1);
        end.setUTCMonth(start.getUTCMonth() + 1, 0);
    }

    return {
        startDate: toDateOnly(start),
        endDate: toDateOnly(end),
    };
}

function pickReportParams(params?: WorkLogReportParams): WorkLogReportParams {
    return REPORT_PARAM_KEYS.reduce((acc, key) => {
        const value = params?.[key];
        if (value !== undefined && value !== null && value !== '') {
            acc[key] = value;
        }
        return acc;
    }, {} as WorkLogReportParams);
}

function getResponseSources(response: unknown) {
    const root = isRecord(response) ? response : {};
    const data = isRecord(root.data) ? root.data : {};
    const rootSummary = isRecord(root.summary) ? root.summary : {};
    const dataSummary = isRecord(data.summary) ? data.summary : {};
    const rootMeta = isRecord(root.meta) ? root.meta : {};
    const dataMeta = isRecord(data.meta) ? data.meta : {};
    const rootPagination = isRecord(root.pagination) ? root.pagination : {};
    const dataPagination = isRecord(data.pagination) ? data.pagination : {};

    return [root, data, rootSummary, dataSummary, rootMeta, dataMeta, rootPagination, dataPagination];
}

function findArrayValue(response: unknown, keys: string[], includeDirectArray = false) {
    if (includeDirectArray && Array.isArray(response)) return { found: true, value: response };

    const root = isRecord(response) ? response : {};
    if (includeDirectArray && Array.isArray(root.data)) return { found: true, value: root.data };
    if (includeDirectArray && isRecord(root.data) && Array.isArray(root.data.data)) {
        return { found: true, value: root.data.data };
    }

    for (const source of getResponseSources(response)) {
        for (const key of keys) {
            if (Array.isArray(source[key])) {
                return { found: true, value: source[key] };
            }
        }
    }

    return { found: false, value: [] };
}

function findResponseValue(response: unknown, keys: string[]) {
    for (const source of getResponseSources(response)) {
        for (const key of keys) {
            const value = source[key];
            if (value !== undefined && value !== null) {
                return value;
            }
        }
    }

    return undefined;
}

function findNumberValue(response: unknown, keys: string[]) {
    const value = findResponseValue(response, keys);
    if (value === undefined || value === null || value === '') return undefined;

    const numeric = Number(value);
    return Number.isNaN(numeric) ? undefined : numeric;
}

function getListPagination(response: unknown, fallbackCount: number) {
    const page = findNumberValue(response, ['page', 'currentPage', 'pageNumber']) || 1;
    const limit = findNumberValue(response, ['limit', 'pageSize', 'perPage']) || REPORT_PAGE_SIZE;
    const total = findNumberValue(response, ['total', 'count', 'totalItems', 'total_count']) || fallbackCount;
    const totalPages = findNumberValue(response, ['totalPages', 'pages', 'total_pages'])
        || Math.max(1, Math.ceil(total / Math.max(1, limit)));

    return { page, limit, total, totalPages };
}

function normalizeWorkLogRecord(workLog: unknown): WorkLogRecord | null {
    if (!isRecord(workLog)) return null;

    const user = isRecord(workLog.user)
        ? workLog.user
        : isRecord(workLog.createdBy)
            ? workLog.createdBy
            : null;
    const task = isRecord(workLog.task) ? workLog.task : null;
    const subTask = isRecord(workLog.subTask)
        ? workLog.subTask
        : isRecord(workLog.subtask)
            ? workLog.subtask
            : null;
    const issue = isRecord(workLog.issue) ? workLog.issue : null;
    const target = task || subTask || issue;

    return {
        ...workLog,
        id: getEntityId(workLog, ['workLogId']),
        targetType: workLog.targetType || (task ? 'TASK' : subTask ? 'SUB_TASK' : issue ? 'ISSUE' : ''),
        targetId: workLog.targetId || getEntityId(target),
        logDate: workLog.logDate || workLog.log_date || '',
        minutesSpent: Number(workLog.minutesSpent || workLog.minutes_spent || 0),
        description: workLog.description ?? '',
        userId: workLog.userId || getEntityId(user, ['userId']),
        projectId: workLog.projectId || '',
        featureId: workLog.featureId || '',
        taskId: workLog.taskId || '',
        subTaskId: workLog.subTaskId || '',
        issueId: workLog.issueId || '',
        user,
    };
}

function extractWorkLogRecords(response: unknown, includeDirectArray = false) {
    const { value } = findArrayValue(response, ['workLogs', 'logs', 'work_logs'], includeDirectArray);

    return value
        .map(normalizeWorkLogRecord)
        .filter((workLog): workLog is WorkLogRecord => !!workLog?.id);
}

function extractSummaryItems(response: unknown) {
    const { value } = findArrayValue(response, ['summaryItems', 'summary', 'items', 'reports'], true);
    return value as WorkLogSummaryItem[];
}

async function fetchReportWorkLogs(params: WorkLogReportParams, startDate: string, endDate: string) {
    const listParams: WorkLogListParams = {
        page: 1,
        limit: REPORT_PAGE_SIZE,
        fromDate: startDate,
        toDate: endDate,
        projectId: params.projectId,
        userId: params.userId,
        orgId: params.orgId,
    };

    const { data: firstPage } = await client.get(API_URLS.workLogs.list, { params: listParams });
    const workLogs = extractWorkLogRecords(firstPage, true);
    const { totalPages } = getListPagination(firstPage, workLogs.length);

    for (let page = 2; page <= totalPages; page += 1) {
        const { data } = await client.get(API_URLS.workLogs.list, {
            params: { ...listParams, page },
        });
        workLogs.push(...extractWorkLogRecords(data, true));
    }

    return workLogs;
}

async function getReport(period: WorkLogReportPeriod, params?: WorkLogReportParams): Promise<WorkLogReportResponse> {
    const reportParams = pickReportParams(params);
    const { data: report } = await client.get(REPORT_ENDPOINTS[period], { params: reportParams });
    const existingWorkLogs = findArrayValue(report, ['workLogs', 'logs', 'work_logs']);
    const { startDate, endDate } = getReportDateRange(period, reportParams.date);
    const workLogs = existingWorkLogs.found
        ? extractWorkLogRecords(report)
        : await fetchReportWorkLogs(reportParams, startDate, endDate);
    const totalMinutes = findNumberValue(report, ['totalMinutes', 'minutesSpent'])
        ?? workLogs.reduce((sum, workLog) => sum + Number(workLog.minutesSpent || 0), 0);
    const totalHours = findNumberValue(report, ['totalHours', 'hoursSpent'])
        ?? totalMinutes / 60;
    const reportBody = isRecord(report) ? report : {};

    return {
        ...reportBody,
        period: String(findResponseValue(report, ['period']) || period),
        startDate: String(findResponseValue(report, ['startDate', 'fromDate']) || startDate),
        endDate: String(findResponseValue(report, ['endDate', 'toDate']) || endDate),
        totalMinutes,
        totalHours,
        summaryItems: extractSummaryItems(report),
        workLogs,
    };
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
        return getReport('daily', params);
    },

    async weekly(params?: WorkLogReportParams) {
        return getReport('weekly', params);
    },

    async monthly(params?: WorkLogReportParams) {
        return getReport('monthly', params);
    },
};

export default workLogsService;
