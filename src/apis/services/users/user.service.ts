/**
 * user.service.ts
 *
 * CRUD operations for Users.
 * Mirrors the backend endpoints:
 *   POST   /user/create
 *   GET    /user/list?page=&limit=&search=&departmentId=&teamId=&roleId=&isActive=&sortBy=&sortOrder=
 *   GET    /user/:id
 *   PATCH  /user/update/:id
 *   DELETE /user/delete/:id
 */

import client from '../../client';
import { API_URLS } from '../../api-url.service';

export interface UserListParams {
    page?: number;
    limit?: number;
    search?: string;
    departmentId?: string;
    teamId?: string;
    roleId?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface UserPayload {
    firstName: string;
    lastName?: string;
    email: string;
    password?: string;
    roleId?: string;
    departmentId?: string;
    teamIds?: string[];
    isActive?: boolean;
}

const userService = {
    /**
     * List users with optional pagination, search, filters, and sorting.
     */
    async list(params?: UserListParams) {
        const { data } = await client.get(API_URLS.users.list, { params });
        return data;
    },

    /**
     * Get a single user by ID.
     */
    async getById(id: string) {
        const { data } = await client.get(API_URLS.users.getById(id));
        return data;
    },

    /**
     * Create a new user.
     */
    async create(payload: UserPayload) {
        const { data } = await client.post(API_URLS.users.create, payload);
        return data;
    },

    /**
     * Update an existing user.
     */
    async update(id: string, payload: Partial<UserPayload>) {
        const { data } = await client.patch(API_URLS.users.update(id), payload);
        return data;
    },

    /**
     * Delete a user.
     */
    async delete(id: string) {
        const { data } = await client.delete(API_URLS.users.delete(id));
        return data;
    },
};

export default userService;
