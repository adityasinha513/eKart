package com.infy.ekart.customer.entity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name="EK_ORDERED_PRODUCT")
public class OrderedProduct {

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Integer orderedProductId;
	private Integer productId;
	private Integer quantity;

	// Price actually paid per unit at order time (after any offer discount), so historical
	// orders show what was paid regardless of how the product's live price changes later.
	private Double unitPrice;
	private String productNameSnapshot;
	@javax.persistence.Column(length = 2000)
	private String descriptionSnapshot;
	@javax.persistence.Column(length = 1000)
	private String imageUrlSnapshot;
	private String categorySnapshot;
	private String unitSnapshot;
	private Integer unitQuantitySnapshot;

	public Integer getOrderedProductId() {
		return orderedProductId;
	}
	public void setOrderedProductId(Integer orderedProductId) {
		this.orderedProductId = orderedProductId;
	}
	public Integer getProductId() {
		return productId;
	}
	public void setProductId(Integer productId) {
		this.productId = productId;
	}
	public Integer getQuantity() {
		return quantity;
	}
	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}
	public Double getUnitPrice() {
		return unitPrice;
	}
	public void setUnitPrice(Double unitPrice) {
		this.unitPrice = unitPrice;
	}
	public String getProductNameSnapshot() { return productNameSnapshot; }
	public void setProductNameSnapshot(String value) { this.productNameSnapshot = value; }
	public String getDescriptionSnapshot() { return descriptionSnapshot; }
	public void setDescriptionSnapshot(String value) { this.descriptionSnapshot = value; }
	public String getImageUrlSnapshot() { return imageUrlSnapshot; }
	public void setImageUrlSnapshot(String value) { this.imageUrlSnapshot = value; }
	public String getCategorySnapshot() { return categorySnapshot; }
	public void setCategorySnapshot(String value) { this.categorySnapshot = value; }
	public String getUnitSnapshot() { return unitSnapshot; }
	public void setUnitSnapshot(String value) { this.unitSnapshot = value; }
	public Integer getUnitQuantitySnapshot() { return unitQuantitySnapshot; }
	public void setUnitQuantitySnapshot(Integer value) { this.unitQuantitySnapshot = value; }

}
