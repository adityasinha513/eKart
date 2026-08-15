package com.infy.ekart.cart.service;

import java.util.Set;

import com.infy.ekart.cart.dto.WishlistItemDTO;
import com.infy.ekart.cart.exception.EKartCustomerCartException;

public interface WishlistService {

	void addProductToWishlist(String customerEmailId, Integer productId) throws EKartCustomerCartException;

	Set<WishlistItemDTO> getWishlistItems(String customerEmailId) throws EKartCustomerCartException;

	void removeProductFromWishlist(String customerEmailId, Integer productId) throws EKartCustomerCartException;

}
