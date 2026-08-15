package com.infy.ekart.cart.dto;

import java.time.LocalDateTime;

import javax.validation.Valid;

public class WishlistItemDTO {

	private Integer wishlistItemId;

	@Valid
	private ProductDTO product;

	private LocalDateTime addedAt;

	public Integer getWishlistItemId() {
		return wishlistItemId;
	}

	public void setWishlistItemId(Integer wishlistItemId) {
		this.wishlistItemId = wishlistItemId;
	}

	public ProductDTO getProduct() {
		return product;
	}

	public void setProduct(ProductDTO product) {
		this.product = product;
	}

	public LocalDateTime getAddedAt() {
		return addedAt;
	}

	public void setAddedAt(LocalDateTime addedAt) {
		this.addedAt = addedAt;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((product.getProductId() == null) ? 0 : product.getProductId().hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		WishlistItemDTO other = (WishlistItemDTO) obj;
		if (product.getProductId() == null) {
			if (other.product.getProductId() != null)
				return false;
		} else if (!product.getProductId().equals(other.product.getProductId()))
			return false;
		return true;
	}

}
