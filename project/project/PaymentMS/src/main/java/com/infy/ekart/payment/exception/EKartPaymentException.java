package com.infy.ekart.payment.exception;

import org.springframework.http.HttpStatus;

public class EKartPaymentException extends Exception {

	private static final long serialVersionUID = 1L;

	private HttpStatus status;

	public EKartPaymentException(String message) {
		super(message);
		this.status = HttpStatus.BAD_REQUEST;
	}

	public EKartPaymentException(String message, HttpStatus status) {
		super(message);
		this.status = status;
	}

	public EKartPaymentException(String message, HttpStatus status, Throwable cause) {
		super(message, cause);
		this.status = status;
	}

	public HttpStatus getStatus() {
		return status;
	}

}
