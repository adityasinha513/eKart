package com.infy.ekart.product.exception;

import org.springframework.http.HttpStatus;

public class EKartProductException extends Exception {

	private static final long serialVersionUID = 1L;

	private HttpStatus status;

	public EKartProductException(String message) {
		super(message);
		this.status = HttpStatus.BAD_REQUEST;
	}

	public EKartProductException(String message, HttpStatus status) {
		super(message);
		this.status = status;
	}

	public HttpStatus getStatus() {
		return status;
	}
}
