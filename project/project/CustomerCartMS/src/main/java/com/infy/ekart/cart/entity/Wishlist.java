package com.infy.ekart.cart.entity;

import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity
@Table(name = "EK_WISHLIST")
public class Wishlist {

	@Id
	@Column(name = "WISHLIST_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer wishlistId;

	@Column(name = "CUSTOMER_EMAIL_ID")
	private String customerEmailId;

	@OneToMany(cascade = CascadeType.ALL)
	@JoinColumn(name = "wishlistId")
	private Set<WishlistItem> wishlistItems;

	public Integer getWishlistId() {
		return wishlistId;
	}

	public void setWishlistId(Integer wishlistId) {
		this.wishlistId = wishlistId;
	}

	public String getCustomerEmailId() {
		return customerEmailId;
	}

	public void setCustomerEmailId(String customerEmailId) {
		this.customerEmailId = customerEmailId;
	}

	public Set<WishlistItem> getWishlistItems() {
		return wishlistItems;
	}

	public void setWishlistItems(Set<WishlistItem> wishlistItems) {
		this.wishlistItems = wishlistItems;
	}

}
