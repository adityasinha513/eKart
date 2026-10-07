package com.infy.ekart.customer.dto;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class AdminOrderStatusUpdateDTO {
	@NotNull
	private OrderStatus status;

	@Size(max = 255)
	private String note;

	public OrderStatus getStatus() { return status; }
	public void setStatus(OrderStatus status) { this.status = status; }
	public String getNote() { return note; }
	public void setNote(String note) { this.note = note; }
}
