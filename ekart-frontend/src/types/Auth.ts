export type Role = "CUSTOMER" | "ADMIN";

export interface AuthUser {
  emailId: string;
  name: string;
  phoneNumber: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type AuthSession = AuthUser & AuthTokens;
