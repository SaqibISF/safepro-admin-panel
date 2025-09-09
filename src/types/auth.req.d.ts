declare type AuthenticatedRequest = {
  user: { id: string; email: string; role: string };
  accessToken: string;
  accessTokenExpiry: Date;
} & Request;
