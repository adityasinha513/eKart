package com.infy.ekart.product.dto;

import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;

public class InventoryReservationRequest {
	@NotNull @Positive
	private Integer orderId;
	@NotEmpty @Valid
	private List<Item> items;

	public Integer getOrderId() { return orderId; }
	public void setOrderId(Integer orderId) { this.orderId = orderId; }
	public List<Item> getItems() { return items; }
	public void setItems(List<Item> items) { this.items = items; }

	public static class Item {
		@NotNull @Positive private Integer productId;
		@NotNull @Positive private Integer quantity;
		public Integer getProductId() { return productId; }
		public void setProductId(Integer productId) { this.productId = productId; }
		public Integer getQuantity() { return quantity; }
		public void setQuantity(Integer quantity) { this.quantity = quantity; }
	}
}
