declare type AuthenticatedRequest = {
  user: { id: string; email: string; role: string };
  accessToken: string;
  accessTokenExpiry: Date;
} & Request;

declare type AdminAuthenticatedRequest = {
  admin: { id: string; email: string };
  accessToken: string;
  accessTokenExpiry: Date;
} & Request;
