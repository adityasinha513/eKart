package com.infy.ekart.cart.repository;

import org.springframework.data.repository.CrudRepository;

import com.infy.ekart.cart.entity.WishlistItem;

public interface WishlistItemRepository extends CrudRepository<WishlistItem, Integer> {

}
