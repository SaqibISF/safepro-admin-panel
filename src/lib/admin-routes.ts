export const ADMIN_LOGIN_ROUTE = "/api/admin/login";

// CREATE, GET
export const USERS_ROUTE = "/api/admin/users";

// GET, UPDATE, DELETE
export const USER_ROUTE = (userId: string) => `/api/admin/users/${userId}`;
