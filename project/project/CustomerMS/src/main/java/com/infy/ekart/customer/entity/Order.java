package com.infy.ekart.customer.entity;

import java.time.LocalDateTime;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.infy.ekart.customer.dto.DeliveryType;
import com.infy.ekart.customer.dto.OrderStatus;
import com.infy.ekart.customer.dto.PaymentThrough;

@Entity
@Table(name = "EK_ORDER")
public class Order {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer orderId;

	private String customerEmailId;

	private LocalDateTime dateOfOrder;

	// Total discount amount (currency), summed from item-level offer discounts at order time
	@Column(precision = 10, scale = 2)
	private Double discount;

	private Double totalPrice;

	@Enumerated(EnumType.STRING)
	private OrderStatus orderStatus;

	@Enumerated(EnumType.STRING)
	private PaymentThrough paymentThrough;

	@Enumerated(EnumType.STRING)
	private DeliveryType deliveryType;

	private LocalDateTime dateOfDelivery;

	@OneToMany(cascade = CascadeType.ALL)
	@JoinColumn(name = "orderId")
	private List<OrderedProduct> orderedProducts;

	// Only set when deliveryType == DELIVERY; references the customer's address book entry
	// used at order time.
	private Integer addressId;

	// The resolved address text, captured at order time so later edits/deletes to the
	// customer's address book don't retroactively change historical orders.
	@Column(length = 1000)
	private String deliveryAddressSnapshot;

	// Only set when deliveryType == PICKUP.
	private String pickupStoreLocation;

	public OrderStatus getOrderStatus() {
		return orderStatus;
	}

	public void setOrderStatus(OrderStatus orderStatus) {
		this.orderStatus = orderStatus;
	}

	public Integer getOrderId() {
		return orderId;
	}

	public void setOrderId(Integer orderId) {
		this.orderId = orderId;
	}

	public Double getTotalPrice() {
		return totalPrice;
	}

	public void setTotalPrice(Double totalPrice) {
		this.totalPrice = totalPrice;
	}

	public PaymentThrough getPaymentThrough() {
		return paymentThrough;
	}

	public void setPaymentThrough(PaymentThrough paymentThrough) {
		this.paymentThrough = paymentThrough;
	}

	public String getCustomerEmailId() {
		return customerEmailId;
	}

	public void setCustomerEmailId(String customerEmailId) {
		this.customerEmailId = customerEmailId;
	}

	public LocalDateTime getDateOfOrder() {
		return dateOfOrder;
	}

	public void setDateOfOrder(LocalDateTime dateOfOrder) {
		this.dateOfOrder = dateOfOrder;
	}

	public LocalDateTime getDateOfDelivery() {
		return dateOfDelivery;
	}

	public void setDateOfDelivery(LocalDateTime dateOfDelivery) {
		this.dateOfDelivery = dateOfDelivery;
	}

	public Double getDiscount() {
		return discount;
	}

	public void setDiscount(Double discount) {
		this.discount = discount;
	}

	public List<OrderedProduct> getOrderedProducts() {
		return orderedProducts;
	}

	public void setOrderedProducts(List<OrderedProduct> orderedProducts) {
		this.orderedProducts = orderedProducts;
	}

	public DeliveryType getDeliveryType() {
		return deliveryType;
	}

	public void setDeliveryType(DeliveryType deliveryType) {
		this.deliveryType = deliveryType;
	}

	public Integer getAddressId() {
		return addressId;
	}

	public void setAddressId(Integer addressId) {
		this.addressId = addressId;
	}

	public String getDeliveryAddressSnapshot() {
		return deliveryAddressSnapshot;
	}

	public void setDeliveryAddressSnapshot(String deliveryAddressSnapshot) {
		this.deliveryAddressSnapshot = deliveryAddressSnapshot;
	}

	public String getPickupStoreLocation() {
		return pickupStoreLocation;
	}

	public void setPickupStoreLocation(String pickupStoreLocation) {
		this.pickupStoreLocation = pickupStoreLocation;
	}

}
