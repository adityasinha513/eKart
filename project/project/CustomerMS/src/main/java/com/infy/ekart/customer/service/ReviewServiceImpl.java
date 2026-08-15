package com.infy.ekart.customer.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.infy.ekart.customer.dto.OrderStatus;
import com.infy.ekart.customer.dto.RatingUpdateDTO;
import com.infy.ekart.customer.dto.ReviewDTO;
import com.infy.ekart.customer.entity.Customer;
import com.infy.ekart.customer.entity.Order;
import com.infy.ekart.customer.entity.OrderedProduct;
import com.infy.ekart.customer.entity.Review;
import com.infy.ekart.customer.exception.EKartCustomerException;
import com.infy.ekart.customer.repository.CustomerRepository;
import com.infy.ekart.customer.repository.OrderRepository;
import com.infy.ekart.customer.repository.ReviewRepository;

@Service(value = "reviewService")
@Transactional
public class ReviewServiceImpl implements ReviewService {

	@Autowired
	private ReviewRepository reviewRepository;

	@Autowired
	private OrderRepository orderRepository;

	@Autowired
	private CustomerRepository customerRepository;

	@Autowired
	private RestTemplate template;

	@Override
	public ReviewDTO submitReview(ReviewDTO reviewDTO) throws EKartCustomerException {
		Order order = orderRepository.findById(reviewDTO.getOrderId())
				.orElseThrow(() -> new EKartCustomerException("OrderService.ORDER_NOT_FOUND"));

		if (!order.getCustomerEmailId().equalsIgnoreCase(reviewDTO.getCustomerEmailId())) {
			throw new EKartCustomerException("ReviewService.ORDER_DOES_NOT_BELONG");
		}
		if (order.getOrderStatus() != OrderStatus.DELIVERED) {
			throw new EKartCustomerException("ReviewService.ORDER_NOT_DELIVERED");
		}
		boolean purchasedThisProduct = order.getOrderedProducts().stream()
				.map(OrderedProduct::getProductId)
				.anyMatch(id -> id.equals(reviewDTO.getProductId()));
		if (!purchasedThisProduct) {
			throw new EKartCustomerException("ReviewService.PRODUCT_NOT_IN_ORDER");
		}

		Optional<Review> existing = reviewRepository.findByCustomerEmailIdAndProductId(
				reviewDTO.getCustomerEmailId(), reviewDTO.getProductId());
		if (existing.isPresent()) {
			throw new EKartCustomerException("ReviewService.ALREADY_REVIEWED");
		}

		Review review = new Review();
		review.setProductId(reviewDTO.getProductId());
		review.setCustomerEmailId(reviewDTO.getCustomerEmailId());
		review.setOrderId(reviewDTO.getOrderId());
		review.setRating(reviewDTO.getRating());
		review.setComment(reviewDTO.getComment());
		reviewRepository.save(review);

		pushRatingToProductMS(reviewDTO.getProductId());

		return mapToDTO(review);
	}

	@Override
	public List<ReviewDTO> getReviewsForProduct(Integer productId) {
		return reviewRepository.findByProductIdAndHiddenFalse(productId).stream()
				.map(this::mapToDTO)
				.collect(Collectors.toList());
	}

	@Override
	public void hideReview(Integer reviewId) throws EKartCustomerException {
		Review review = findReviewOrThrow(reviewId);
		review.setHidden(true);
		reviewRepository.save(review);
		pushRatingToProductMS(review.getProductId());
	}

	@Override
	public void unhideReview(Integer reviewId) throws EKartCustomerException {
		Review review = findReviewOrThrow(reviewId);
		review.setHidden(false);
		reviewRepository.save(review);
		pushRatingToProductMS(review.getProductId());
	}

	private Review findReviewOrThrow(Integer reviewId) throws EKartCustomerException {
		return reviewRepository.findById(reviewId)
				.orElseThrow(() -> new EKartCustomerException("ReviewService.REVIEW_NOT_FOUND"));
	}

	private void pushRatingToProductMS(Integer productId) {
		List<Review> visibleReviews = reviewRepository.findByProductIdAndHiddenFalse(productId);
		int count = visibleReviews.size();
		double average = count == 0 ? 0.0
				: visibleReviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
		double rounded = Math.round(average * 10.0) / 10.0;

		RatingUpdateDTO ratingUpdateDTO = new RatingUpdateDTO();
		ratingUpdateDTO.setAvgRating(rounded);
		ratingUpdateDTO.setRatingCount(count);
		template.put("http://localhost:3334/Ekart/product-api/product/" + productId + "/rating", ratingUpdateDTO);
	}

	private ReviewDTO mapToDTO(Review review) {
		ReviewDTO reviewDTO = new ReviewDTO();
		reviewDTO.setReviewId(review.getReviewId());
		reviewDTO.setProductId(review.getProductId());
		reviewDTO.setCustomerEmailId(review.getCustomerEmailId());
		reviewDTO.setOrderId(review.getOrderId());
		reviewDTO.setRating(review.getRating());
		reviewDTO.setComment(review.getComment());
		reviewDTO.setCreatedAt(review.getCreatedAt());
		reviewDTO.setHidden(review.isHidden());
		customerRepository.findById(review.getCustomerEmailId().toLowerCase())
				.map(Customer::getName)
				.ifPresent(reviewDTO::setCustomerName);
		return reviewDTO;
	}

}
