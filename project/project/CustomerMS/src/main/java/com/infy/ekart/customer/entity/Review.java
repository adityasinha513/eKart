package com.infy.ekart.customer.entity;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * A customer's review of a product. Only allowed once a DELIVERED order containing that
 * product exists for the customer (enforced in ReviewServiceImpl, not here) — one review per
 * (customer, product) pair.
 */
@Entity
@Table(name = "EK_REVIEW")
public class Review {

	@Id
	@Column(name = "REVIEW_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer reviewId;

	@Column(name = "PRODUCT_ID")
	private Integer productId;

	@Column(name = "CUSTOMER_EMAIL_ID")
	private String customerEmailId;

	@Column(name = "ORDER_ID")
	private Integer orderId;

	@Column(name = "RATING")
	private Integer rating;

	@Column(name = "COMMENT", length = 1000)
	private String comment;

	@Column(name = "CREATED_AT")
	private LocalDateTime createdAt = LocalDateTime.now();

	@Column(name = "IS_HIDDEN")
	private boolean hidden = false;

	public Integer getReviewId() {
		return reviewId;
	}

	public void setReviewId(Integer reviewId) {
		this.reviewId = reviewId;
	}

	public Integer getProductId() {
		return productId;
	}

	public void setProductId(Integer productId) {
		this.productId = productId;
	}

	public String getCustomerEmailId() {
		return customerEmailId;
	}

	public void setCustomerEmailId(String customerEmailId) {
		this.customerEmailId = customerEmailId;
	}

	public Integer getOrderId() {
		return orderId;
	}

	public void setOrderId(Integer orderId) {
		this.orderId = orderId;
	}

	public Integer getRating() {
		return rating;
	}

	public void setRating(Integer rating) {
		this.rating = rating;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public boolean isHidden() {
		return hidden;
	}

	public void setHidden(boolean hidden) {
		this.hidden = hidden;
	}

}
