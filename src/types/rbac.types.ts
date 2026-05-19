/**
 * ============================================================
 * RBAC TYPE DEFINITIONS
 * ============================================================
 *
 * Central TypeScript types for the Role-Based Access Control system.
 * Used across API services, Redux slice, hooks, and guard components.
 *
 * These types mirror the backend's 5 relational tables:
 *   Modules, Permissions, Module_Permissions, Role_Permissions, Roles
 * ============================================================
 */

// ─── User Roles ───────────────────────────────────────────────────────────────

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  MODERATOR = 'MODERATOR',
  TEAM_LEADER = 'TEAM_LEADER',
  USER = 'USER',
  STAFF = 'STAFF',
}

// ─── Permission Actions ───────────────────────────────────────────────────────

export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

// ─── Role ─────────────────────────────────────────────────────────────────────

export interface Role {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Permission ───────────────────────────────────────────────────────────────

export interface Permission {
  id: string;
  name: string;
  key: string; // e.g. "CREATE", "READ", "UPDATE", "DELETE"
}

// ─── Module Permission (from /me/permissions response) ────────────────────────

export interface ModulePermission {
  id: string;        // permissionId
  name: string;      // e.g. "Create"
  key: string;       // e.g. "CREATE"
}

// ─── Module (from /me/permissions response) ───────────────────────────────────

export interface Module {
  id: string;
  name: string;
  key: string;       // e.g. "dashboard", "users", "inventory"
  path: string;      // e.g. "/dashboard", "/users"
  icon: string;      // lucide-react icon name e.g. "LayoutDashboard"
  parentId: string | null;
  sortOrder: number;
  permissions: ModulePermission[];
}

// ─── Permission Manifest (full /me/permissions response) ──────────────────────

export interface PermissionManifest {
  role: Role;
  modules: Module[];
}

// ─── Flattened Permission Map ─────────────────────────────────────────────────
// Key: module key (e.g. "inventory")
// Value: array of permission keys (e.g. ["CREATE", "READ", "UPDATE", "DELETE"])
// This enables O(1) module lookup + O(n) permission check within a module

export type PermissionMap = Record<string, string[]>;

// ─── Module CRUD (for Menu Master) ────────────────────────────────────────────

export interface CreateModulePayload {
  name: string;
  key: string;
  path: string;
  icon: string;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateModulePayload extends Partial<CreateModulePayload> {}

export interface ModuleListItem {
  id: string;
  name: string;
  key: string;
  path: string;
  icon: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Role CRUD (for Role Master) ──────────────────────────────────────────────

export interface CreateRolePayload {
  name: string;
  description: string;
}

export interface UpdateRolePayload extends Partial<CreateRolePayload> {
  isActive?: boolean;
}

// ─── Role Permission Assignment ───────────────────────────────────────────────

export interface RolePermissionItem {
  moduleId: string;
  moduleName: string;
  moduleKey: string;
  permissions: {
    permissionId: string;
    permissionName: string;
    permissionKey: string;
    allowed: boolean;
  }[];
}

export interface AssignPermissionPayload {
  permissions: {
    modulePermissionId: string;
    allowed: boolean;
  }[];
}
