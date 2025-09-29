declare type AuthRequest = {
  user: { id: string; email: string };
  accessToken: string;
  accessTokenExpiry: Date;
} & Request;
