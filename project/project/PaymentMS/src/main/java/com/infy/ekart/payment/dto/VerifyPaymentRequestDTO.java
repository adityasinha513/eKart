package com.infy.ekart.payment.dto;

import javax.validation.constraints.NotNull;

public class VerifyPaymentRequestDTO {

	@NotNull(message = "{transaction.orderid.notpresent}")
	private Integer orderId;

	@NotNull(message = "{payment.gatewayorderid.absent}")
	private String gatewayOrderId;

	@NotNull(message = "{payment.gatewaypaymentid.absent}")
	private String gatewayPaymentId;

	@NotNull(message = "{payment.gatewaysignature.absent}")
	private String gatewaySignature;

	public Integer getOrderId() {
		return orderId;
	}

	public void setOrderId(Integer orderId) {
		this.orderId = orderId;
	}

	public String getGatewayOrderId() {
		return gatewayOrderId;
	}

	public void setGatewayOrderId(String gatewayOrderId) {
		this.gatewayOrderId = gatewayOrderId;
	}

	public String getGatewayPaymentId() {
		return gatewayPaymentId;
	}

	public void setGatewayPaymentId(String gatewayPaymentId) {
		this.gatewayPaymentId = gatewayPaymentId;
	}

	public String getGatewaySignature() {
		return gatewaySignature;
	}

	public void setGatewaySignature(String gatewaySignature) {
		this.gatewaySignature = gatewaySignature;
	}

}
