package com.infy.ekart.cart.repository;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.infy.ekart.cart.entity.Wishlist;

public interface WishlistRepository extends CrudRepository<Wishlist, Integer> {

	Optional<Wishlist> findByCustomerEmailId(String customerEmailId);

}
