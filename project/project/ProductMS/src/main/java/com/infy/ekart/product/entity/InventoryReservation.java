package com.infy.ekart.product.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

@Entity
@Table(name = "EK_INVENTORY_RESERVATION", uniqueConstraints = @UniqueConstraint(columnNames = {"ORDER_ID", "PRODUCT_ID"}))
public class InventoryReservation {
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer reservationId;
	@Column(name = "ORDER_ID", nullable = false)
	private Integer orderId;
	@Column(name = "PRODUCT_ID", nullable = false)
	private Integer productId;
	@Column(nullable = false)
	private Integer quantity;
	@Column(nullable = false, length = 16)
	private String state;
	public Integer getReservationId() { return reservationId; }
	public void setReservationId(Integer reservationId) { this.reservationId = reservationId; }
	public Integer getOrderId() { return orderId; }
	public void setOrderId(Integer orderId) { this.orderId = orderId; }
	public Integer getProductId() { return productId; }
	public void setProductId(Integer productId) { this.productId = productId; }
	public Integer getQuantity() { return quantity; }
	public void setQuantity(Integer quantity) { this.quantity = quantity; }
	public String getState() { return state; }
	public void setState(String state) { this.state = state; }
}
