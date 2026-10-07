/** Return customer-safe copy; service exception details belong in server logs, not the UI. */
export function extractErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as { response?: { status?: number }; code?: string };
  const status = axiosError?.response?.status;
  if (!status || axiosError?.code === "ERR_NETWORK") return "We couldn’t reach the shop. Check your connection and try again.";
  if (status === 401) return "Please sign in again to continue.";
  if (status === 403) return "This action is not available for your account.";
  if (status === 404) return "This item could not be found.";
  if (status === 429) return "Please wait a moment and try again.";
  if (status >= 500) return "Something went wrong on our side. Please try again shortly.";
  return fallback;
}
