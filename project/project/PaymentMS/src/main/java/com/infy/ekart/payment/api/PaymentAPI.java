package com.infy.ekart.payment.api;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.ekart.payment.dto.PaymentTransactionDTO;
import com.infy.ekart.payment.dto.VerifyPaymentRequestDTO;
import com.infy.ekart.payment.exception.EKartPaymentException;
import com.infy.ekart.payment.service.PaymentService;

/**
 * Online-payment orchestration against Razorpay. Card/UPI details are entered inside
 * Razorpay's own Checkout widget on the frontend and never reach this service — we only
 * ever see gateway-issued order/payment/signature references. Cash on Delivery orders never
 * touch this controller at all (see CustomerMS.OrderServiceImpl, which auto-confirms COD
 * orders at placement).
 */
@CrossOrigin
@RestController
@Validated
@RequestMapping(value = "/payment-api")
public class PaymentAPI {

	@Autowired
	private PaymentService paymentService;

	private static final Log LOGGER = LogFactory.getLog(PaymentAPI.class);

	@PostMapping(value = "/customer/{customerEmailId:.+}/order/{orderId}/create-payment-order")
	public ResponseEntity<PaymentTransactionDTO> createPaymentOrder(
			@Pattern(regexp = "[a-zA-Z0-9._]+@[a-zA-Z]{2,}\\.[a-zA-Z][a-zA-Z.]+", message = "{invalid.email.format}") @PathVariable String customerEmailId,
			@NotNull(message = "{orderId.absent}") @PathVariable Integer orderId) throws EKartPaymentException {
		LOGGER.info("Creating Razorpay order for order " + orderId + ", customer " + customerEmailId);
		return new ResponseEntity<>(paymentService.createPaymentOrder(customerEmailId, orderId), HttpStatus.CREATED);
	}

	@PostMapping(value = "/customer/{customerEmailId:.+}/verify-payment")
	public ResponseEntity<PaymentTransactionDTO> verifyPayment(
			@Pattern(regexp = "[a-zA-Z0-9._]+@[a-zA-Z]{2,}\\.[a-zA-Z][a-zA-Z.]+", message = "{invalid.email.format}") @PathVariable String customerEmailId,
			@Valid @RequestBody VerifyPaymentRequestDTO request) throws EKartPaymentException {
		LOGGER.info("Verifying payment for order " + request.getOrderId() + ", customer " + customerEmailId);
		return new ResponseEntity<>(paymentService.verifyPayment(customerEmailId, request), HttpStatus.OK);
	}

}
