/**
 * AdminMS (/api/admin/**) is not built yet on any of the underlying services. These stubs
 * exist so the admin page shells can call a "real" service layer and show a "not yet
 * connected" placeholder instead of hand-waving fake data.
 */

export async function getAdminDashboardSummary(): Promise<never> {
  throw new Error("Admin APIs are not connected yet.");
}

export async function getAdminProducts(): Promise<never> {
  throw new Error("Admin APIs are not connected yet.");
}

export async function getAdminCategories(): Promise<never> {
  throw new Error("Admin APIs are not connected yet.");
}

export async function getAdminOffers(): Promise<never> {
  throw new Error("Admin APIs are not connected yet.");
}

export async function getAdminOrders(): Promise<never> {
  throw new Error("Admin APIs are not connected yet.");
}

export async function getAdminCustomers(): Promise<never> {
  throw new Error("Admin APIs are not connected yet.");
}

export async function getAdminReviews(): Promise<never> {
  throw new Error("Admin APIs are not connected yet.");
}
