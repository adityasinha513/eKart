package com.infy.ekart.customer.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.ekart.customer.exception.EKartCustomerException;
import com.infy.ekart.customer.service.ReviewService;

/**
 * Reachable externally only via /api/admin/reviews/** through EkartGateway. Admin-role
 * enforcement is added in the security hardening pass, alongside the rest of the admin
 * surface — see SecurityConfig's class comment for the current trust model.
 */
@RestController
@RequestMapping(value = "/admin-api/reviews")
public class AdminReviewAPI {

	@Autowired
	private ReviewService reviewService;

	@Autowired
	private Environment environment;

	@PatchMapping(value = "/{reviewId}/hide")
	public ResponseEntity<String> hideReview(@PathVariable Integer reviewId) throws EKartCustomerException {
		reviewService.hideReview(reviewId);
		return new ResponseEntity<>(environment.getProperty("AdminReviewAPI.REVIEW_HIDDEN"), HttpStatus.OK);
	}

	@PatchMapping(value = "/{reviewId}/unhide")
	public ResponseEntity<String> unhideReview(@PathVariable Integer reviewId) throws EKartCustomerException {
		reviewService.unhideReview(reviewId);
		return new ResponseEntity<>(environment.getProperty("AdminReviewAPI.REVIEW_UNHIDDEN"), HttpStatus.OK);
	}

}
