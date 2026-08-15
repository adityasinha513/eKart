/**
 * Backend error responses come back as either a raw string body (e.g. some CustomerCartMS/
 * OrderMS endpoints) or a structured {errorMessage, errorCode, timestamp} JSON body (the
 * EKartCustomerException / EKartProductException family). This normalizes either shape into
 * a displayable string.
 */
export function extractErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as { response?: { data?: unknown } };
  const data = axiosError?.response?.data;

  if (typeof data === "string" && data.trim().length > 0) return data;

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.errorMessage === "string") return record.errorMessage;
    if (typeof record.message === "string") return record.message;
  }

  return fallback;
}
