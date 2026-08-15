import { apiClient } from "./client";
import type { AuthSession } from "../../types/Auth";

export interface LoginPayload {
  emailId: string;
  password: string;
}

export interface RegisterPayload {
  emailId: string;
  name: string;
  password: string;
  phoneNumber: string;
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const { data } = await apiClient.post<AuthSession>("/auth/login", payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<string> {
  const { data } = await apiClient.post<string>("/auth/register", payload);
  return data;
}

export async function refreshToken(refreshTokenValue: string): Promise<AuthSession> {
  const { data } = await apiClient.post<AuthSession>("/auth/refresh-token", {
    refreshToken: refreshTokenValue,
  });
  return data;
}

export async function logout(refreshTokenValue: string): Promise<void> {
  await apiClient.post("/auth/logout", { refreshToken: refreshTokenValue });
}
