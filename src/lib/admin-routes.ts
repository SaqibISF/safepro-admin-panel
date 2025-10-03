export const ADMIN_LOGIN_ROUTE = "/api/admin/login";

// CREATE, GET
export const USERS_ROUTE = "/api/admin/users";

// GET, UPDATE, DELETE
export const USER_ROUTE = (userId: string) => `/api/admin/users/${userId}`;

// CREATE, GET
export const VPS_SERVERS_ROUTE = "/api/admin/vps-servers";

// GET, UPDATE, DELETE
export const VPS_SERVER_ROUTE = (serverId: string) =>
  `/api/admin/vps-servers/${serverId}`;

// CREATE, GET
export const VPS_GROUPS_ROUTE = "/api/admin/vps-groups";

// GET, UPDATE, DELETE
export const VPS_GROUP_ROUTE = (groupId: string) =>
  `/api/admin/vps-groups/${groupId}`;
