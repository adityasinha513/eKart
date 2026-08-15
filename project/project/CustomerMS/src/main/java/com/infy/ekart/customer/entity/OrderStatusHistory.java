package com.infy.ekart.customer.entity;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.infy.ekart.customer.dto.OrderStatus;

/**
 * One row per status transition an order goes through, so customers/admins get a real
 * timeline (Order Placed -> Confirmed -> Preparing -> ...) instead of only the current
 * flat status.
 */
@Entity
@Table(name = "EK_ORDER_STATUS_HISTORY")
public class OrderStatusHistory {

	@Id
	@Column(name = "HISTORY_ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer historyId;

	@Column(name = "ORDER_ID")
	private Integer orderId;

	@Enumerated(EnumType.STRING)
	@Column(name = "STATUS")
	private OrderStatus status;

	@Column(name = "CHANGED_AT")
	private LocalDateTime changedAt;

	@Column(name = "CHANGED_BY")
	private String changedBy;

	@Column(name = "NOTE")
	private String note;

	public Integer getHistoryId() {
		return historyId;
	}

	public void setHistoryId(Integer historyId) {
		this.historyId = historyId;
	}

	public Integer getOrderId() {
		return orderId;
	}

	public void setOrderId(Integer orderId) {
		this.orderId = orderId;
	}

	public OrderStatus getStatus() {
		return status;
	}

	public void setStatus(OrderStatus status) {
		this.status = status;
	}

	public LocalDateTime getChangedAt() {
		return changedAt;
	}

	public void setChangedAt(LocalDateTime changedAt) {
		this.changedAt = changedAt;
	}

	public String getChangedBy() {
		return changedBy;
	}

	public void setChangedBy(String changedBy) {
		this.changedBy = changedBy;
	}

	public String getNote() {
		return note;
	}

	public void setNote(String note) {
		this.note = note;
	}

}
