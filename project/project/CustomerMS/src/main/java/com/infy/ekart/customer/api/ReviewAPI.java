package com.infy.ekart.customer.api;

import java.util.List;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.ekart.customer.dto.ReviewDTO;
import com.infy.ekart.customer.exception.EKartCustomerException;
import com.infy.ekart.customer.service.ReviewService;

@CrossOrigin
@RestController
@RequestMapping(value = "/review-api")
public class ReviewAPI {

	@Autowired
	private ReviewService reviewService;

	@GetMapping(value = "/product/{productId}")
	public ResponseEntity<List<ReviewDTO>> getReviewsForProduct(@PathVariable Integer productId) {
		return new ResponseEntity<>(reviewService.getReviewsForProduct(productId), HttpStatus.OK);
	}

	@PostMapping
	public ResponseEntity<ReviewDTO> submitReview(@Valid @RequestBody ReviewDTO reviewDTO)
			throws EKartCustomerException {
		return new ResponseEntity<>(reviewService.submitReview(reviewDTO), HttpStatus.CREATED);
	}

}
