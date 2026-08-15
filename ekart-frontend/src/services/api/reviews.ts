/**
 * ReviewMS is not built yet (/api/reviews/** returns nothing live on the gateway). These
 * functions have the intended real signatures so callers/UI don't need to change once it
 * ships — for now they reject so callers can show a graceful "coming soon" state.
 */

export interface Review {
  reviewId: number;
  productId: number;
  orderId: number;
  customerEmailId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export async function getProductReviews(_productId: number): Promise<Review[]> {
  throw new Error("Reviews are not available yet — coming soon.");
}

export async function submitReview(
  _productId: number,
  _orderId: number,
  _rating: number,
  _comment: string
): Promise<Review> {
  throw new Error("Submitting reviews is not available yet — coming soon.");
}
