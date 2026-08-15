package com.infy.ekart.product.entity;

import java.time.LocalDate;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * An admin-managed discount, scoped to either a single product or a whole category
 * (never both). Applied at read time in CustomerProductServiceImpl rather than stored on
 * the product itself, so a single offer can affect many products and can be scheduled
 * ahead of time without touching product rows.
 */
@Entity
@Table(name = "EK_OFFER")
public class Offer {

	@Id
	@Column(name = "OFFER_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer offerId;

	@Column(name = "NAME", nullable = false)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(name = "DISCOUNT_TYPE", nullable = false)
	private DiscountType discountType;

	@Column(name = "DISCOUNT_VALUE", nullable = false)
	private Double discountValue;

	@Column(name = "PRODUCT_ID")
	private Integer productId;

	@Column(name = "CATEGORY_ID")
	private Integer categoryId;

	@Column(name = "START_DATE", nullable = false)
	private LocalDate startDate;

	@Column(name = "END_DATE", nullable = false)
	private LocalDate endDate;

	@Column(name = "IS_ACTIVE")
	private boolean active = true;

	public Integer getOfferId() {
		return offerId;
	}

	public void setOfferId(Integer offerId) {
		this.offerId = offerId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public DiscountType getDiscountType() {
		return discountType;
	}

	public void setDiscountType(DiscountType discountType) {
		this.discountType = discountType;
	}

	public Double getDiscountValue() {
		return discountValue;
	}

	public void setDiscountValue(Double discountValue) {
		this.discountValue = discountValue;
	}

	public Integer getProductId() {
		return productId;
	}

	public void setProductId(Integer productId) {
		this.productId = productId;
	}

	public Integer getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(Integer categoryId) {
		this.categoryId = categoryId;
	}

	public LocalDate getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}

	public LocalDate getEndDate() {
		return endDate;
	}

	public void setEndDate(LocalDate endDate) {
		this.endDate = endDate;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public boolean isCurrentlyRunning() {
		LocalDate today = LocalDate.now();
		return active && !today.isBefore(startDate) && !today.isAfter(endDate);
	}

}
