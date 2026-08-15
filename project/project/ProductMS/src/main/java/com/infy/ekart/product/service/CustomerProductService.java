package com.infy.ekart.product.service;

import java.util.List;

import com.infy.ekart.product.dto.ProductDTO;
import com.infy.ekart.product.exception.EKartProductException;

public interface CustomerProductService {

	List<ProductDTO> getAllProducts(Integer categoryId, String search, Boolean vegOnly, Boolean bestSellerOnly,
			Boolean newArrivalsOnly, Double minPrice, Double maxPrice, String sortBy) throws EKartProductException;

	ProductDTO getProductById(Integer productId) throws EKartProductException;

	void reduceAvailableQuantity(Integer productId, Integer quantity) throws EKartProductException;

	ProductDTO createProduct(ProductDTO productDTO) throws EKartProductException;

	ProductDTO updateProduct(Integer productId, ProductDTO productDTO) throws EKartProductException;

	void deleteProduct(Integer productId) throws EKartProductException;

	ProductDTO setAvailability(Integer productId, boolean available) throws EKartProductException;

	void updateProductRating(Integer productId, Double avgRating, Integer ratingCount) throws EKartProductException;

}
