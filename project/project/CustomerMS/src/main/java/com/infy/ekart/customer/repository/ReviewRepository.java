package com.infy.ekart.customer.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.infy.ekart.customer.entity.Review;

public interface ReviewRepository extends CrudRepository<Review, Integer> {

	List<Review> findByProductIdAndHiddenFalse(Integer productId);

	List<Review> findByProductId(Integer productId);

	Optional<Review> findByCustomerEmailIdAndProductId(String customerEmailId, Integer productId);

}
