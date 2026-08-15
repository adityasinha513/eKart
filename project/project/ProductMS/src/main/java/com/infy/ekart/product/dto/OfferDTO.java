package com.infy.ekart.product.dto;

import java.time.LocalDate;

import javax.validation.constraints.NotNull;

public class OfferDTO {

	private Integer offerId;

	@NotNull(message = "{offer.name.absent}")
	private String name;

	@NotNull(message = "{offer.discounttype.absent}")
	private String discountType;

	@NotNull(message = "{offer.discountvalue.absent}")
	private Double discountValue;

	private Integer productId;
	private Integer categoryId;

	@NotNull(message = "{offer.startdate.absent}")
	private LocalDate startDate;

	@NotNull(message = "{offer.enddate.absent}")
	private LocalDate endDate;

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

	public String getDiscountType() {
		return discountType;
	}

	public void setDiscountType(String discountType) {
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

}
