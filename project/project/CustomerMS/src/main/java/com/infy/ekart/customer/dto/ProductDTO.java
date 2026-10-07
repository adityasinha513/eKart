package com.infy.ekart.customer.dto;

import javax.validation.constraints.NotNull;

public class ProductDTO {
	@NotNull(message = "{cartproduct.productid.absent}")
	private Integer productId;
	private String name;
	private String description;
	private String category;
	private String brand;
	private String imageUrl;
	private String unit;
	private Integer unitQuantity;
	private Double price;
	// Populated by ProductMS when an active offer applies; null otherwise.
	private Double discountedPrice;
	private Integer availableQuantity;
	private boolean available;


	public Integer getProductId() {
		return productId;
	}
	public void setProductId(Integer productId) {
		this.productId = productId;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public String getCategory() {
		return category;
	}
	public void setCategory(String category) {
		this.category = category;
	}
	public String getImageUrl() { return imageUrl; }
	public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
	public String getUnit() { return unit; }
	public void setUnit(String unit) { this.unit = unit; }
	public Integer getUnitQuantity() { return unitQuantity; }
	public void setUnitQuantity(Integer unitQuantity) { this.unitQuantity = unitQuantity; }
	public String getBrand() {
		return brand;
	}
	public void setBrand(String brand) {
		this.brand = brand;
	}
	public Double getPrice() {
		return price;
	}
	public void setPrice(Double price) {
		this.price = price;
	}
	public Double getDiscountedPrice() {
		return discountedPrice;
	}
	public void setDiscountedPrice(Double discountedPrice) {
		this.discountedPrice = discountedPrice;
	}

	
	public Integer getAvailableQuantity() {
		return availableQuantity;
	}
	public void setAvailableQuantity(Integer availableQuantity) {
		this.availableQuantity = availableQuantity;
	}
	public boolean isAvailable() { return available; }
	public void setAvailable(boolean available) { this.available = available; }
	
	
	


}
