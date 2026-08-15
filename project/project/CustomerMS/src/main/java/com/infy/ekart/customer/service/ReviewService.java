package com.infy.ekart.customer.service;

import java.util.List;

import com.infy.ekart.customer.dto.ReviewDTO;
import com.infy.ekart.customer.exception.EKartCustomerException;

public interface ReviewService {

	ReviewDTO submitReview(ReviewDTO reviewDTO) throws EKartCustomerException;

	List<ReviewDTO> getReviewsForProduct(Integer productId);

	void hideReview(Integer reviewId) throws EKartCustomerException;

	void unhideReview(Integer reviewId) throws EKartCustomerException;

}
