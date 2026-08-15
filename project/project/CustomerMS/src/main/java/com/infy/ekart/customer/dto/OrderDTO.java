package com.infy.ekart.customer.dto;

import java.time.LocalDateTime;
import java.util.List;

import javax.validation.constraints.Future;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;



public class OrderDTO {
	
	private Integer orderId;
	@NotNull(message = "{email.absent}")
	@Pattern(regexp = "[a-zA-Z0-9._]+@[a-zA-Z]{2,}\\.[a-zA-Z][a-zA-Z.]+", message = "{invalid.email.format}")
	private String customerEmailId;
	private LocalDateTime dateOfOrder;
	private Double totalPrice;
	private String orderStatus;
	private Double discount;
	@NotNull(message = "{order.paymentthrough.absent}")
	@Pattern(regexp = "(ONLINE|COD)", message = "{order.paymentthrough.invalid}")
	private String paymentThrough;
	@NotNull(message = "{order.dateofdelivery.absent}")
	@Future(message = "{order.dateofdelivery.invalid}")

	private LocalDateTime dateOfDelivery;

	@NotNull(message = "{order.deliverytype.absent}")
	@Pattern(regexp = "(DELIVERY|PICKUP)", message = "{order.deliverytype.invalid}")
	private String deliveryType;

	// Required (and only meaningful) when deliveryType == DELIVERY: must reference one of
	// the customer's own saved addresses.
	private Integer addressId;

	// Response-only: the resolved address text or pickup store location.
	private String deliveryAddressSnapshot;
	private String pickupStoreLocation;

	private List<OrderStatusHistoryDTO> statusHistory;

	private List<OrderedProductDTO> orderedProducts;
	public String getOrderStatus() {
		return orderStatus;
	}
	public void setOrderStatus(String orderStatus) {
		this.orderStatus = orderStatus;
	}
	
	public Integer getOrderId() {
		return orderId;
	}
	public void setOrderId(Integer orderId) {
		this.orderId = orderId;
	}
	public String getCustomerEmailId() {
		return customerEmailId;
	}
	public void setCustomerEmailId(String customerEmailId) {
		this.customerEmailId = customerEmailId;
	}
	
	public Double getTotalPrice() {
		return totalPrice;
	}
	public void setTotalPrice(Double totalPrice) {
		this.totalPrice = totalPrice;
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
	public List<OrderedProductDTO> getOrderedProducts() {
		return orderedProducts;
	}
	public void setOrderedProducts(List<OrderedProductDTO> orderedProducts) {
		this.orderedProducts = orderedProducts;
	}
	public String getPaymentThrough() {
		return paymentThrough;
	}
	public void setPaymentThrough(String paymentThrough) {
		this.paymentThrough = paymentThrough;
	}
	public String getDeliveryType() {
		return deliveryType;
	}
	public void setDeliveryType(String deliveryType) {
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
	public List<OrderStatusHistoryDTO> getStatusHistory() {
		return statusHistory;
	}
	public void setStatusHistory(List<OrderStatusHistoryDTO> statusHistory) {
		this.statusHistory = statusHistory;
	}

}
