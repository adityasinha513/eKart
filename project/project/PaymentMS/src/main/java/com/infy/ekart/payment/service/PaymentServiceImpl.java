package com.infy.ekart.payment.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.infy.ekart.payment.dto.OrderDTO;
import com.infy.ekart.payment.dto.PaymentTransactionDTO;
import com.infy.ekart.payment.dto.PaymentTransactionStatus;
import com.infy.ekart.payment.dto.VerifyPaymentRequestDTO;
import com.infy.ekart.payment.entity.PaymentTransaction;
import com.infy.ekart.payment.exception.EKartPaymentException;
import com.infy.ekart.payment.repository.PaymentTransactionRepository;

@Service(value = "paymentService")
@Transactional
public class PaymentServiceImpl implements PaymentService {

	@Autowired
	private PaymentTransactionRepository paymentTransactionRepository;

	@Autowired
	private RazorpayGatewayService razorpayGatewayService;

	@Autowired
	private PaymentCircuitBreakerService paymentCircuitBreakerService;

	@Autowired
	private RestTemplate template;

	@Override
	public PaymentTransactionDTO createPaymentOrder(String customerEmailId, Integer orderId)
			throws EKartPaymentException {
		OrderDTO order = fetchOrder(orderId);

		if (!order.getCustomerEmailId().equalsIgnoreCase(customerEmailId)) {
			throw new EKartPaymentException("PaymentService.ORDER_DOES_NOT_BELONGS");
		}
		if (!"PLACED".equals(order.getOrderStatus())) {
			throw new EKartPaymentException("PaymentService.TRANSACTION_ALREADY_DONE");
		}
		if (!"ONLINE".equals(order.getPaymentThrough())) {
			throw new EKartPaymentException("PaymentService.ORDER_NOT_ONLINE_PAYMENT");
		}

		String gatewayOrderId = razorpayGatewayService.createOrder(orderId, order.getTotalPrice());

		PaymentTransaction transaction = new PaymentTransaction();
		transaction.setOrderId(orderId);
		transaction.setCustomerEmailId(customerEmailId);
		transaction.setGatewayOrderId(gatewayOrderId);
		transaction.setAmount(order.getTotalPrice());
		transaction.setStatus(PaymentTransactionStatus.CREATED);
		paymentTransactionRepository.save(transaction);

		return mapToDTO(transaction, razorpayGatewayService.getKeyId());
	}

	@Override
	public PaymentTransactionDTO verifyPayment(String customerEmailId, VerifyPaymentRequestDTO request)
			throws EKartPaymentException {
		PaymentTransaction transaction = paymentTransactionRepository.findByGatewayOrderId(request.getGatewayOrderId())
				.orElseThrow(() -> new EKartPaymentException("PaymentService.TRANSACTION_NOT_FOUND", HttpStatus.NOT_FOUND));

		if (!transaction.getOrderId().equals(request.getOrderId())
				|| !transaction.getCustomerEmailId().equalsIgnoreCase(customerEmailId)) {
			throw new EKartPaymentException("PaymentService.ORDER_DOES_NOT_BELONGS");
		}

		boolean valid = razorpayGatewayService.verifySignature(request.getGatewayOrderId(),
				request.getGatewayPaymentId(), request.getGatewaySignature());

		transaction.setGatewayPaymentId(request.getGatewayPaymentId());
		transaction.setGatewaySignature(request.getGatewaySignature());
		transaction.setUpdatedAt(LocalDateTime.now());

		if (valid) {
			transaction.setStatus(PaymentTransactionStatus.CAPTURED);
			paymentCircuitBreakerService.updateOrderAfterPayment(transaction.getOrderId(), "TRANSACTION_SUCCESS");
		} else {
			transaction.setStatus(PaymentTransactionStatus.FAILED);
			paymentCircuitBreakerService.updateOrderAfterPayment(transaction.getOrderId(), "TRANSACTION_FAILED");
		}

		paymentTransactionRepository.save(transaction);

		if (!valid) {
			throw new EKartPaymentException("PaymentService.SIGNATURE_VERIFICATION_FAILED");
		}

		return mapToDTO(transaction, null);
	}

	private OrderDTO fetchOrder(Integer orderId) throws EKartPaymentException {
		try {
			return template.getForEntity("http://localhost:3336/Ekart/customerorder-api/order/" + orderId, OrderDTO.class)
					.getBody();
		} catch (Exception e) {
			throw new EKartPaymentException("PaymentService.ORDER_NOT_FOUND", HttpStatus.NOT_FOUND, e);
		}
	}

	private PaymentTransactionDTO mapToDTO(PaymentTransaction transaction, String razorpayKeyId) {
		PaymentTransactionDTO dto = new PaymentTransactionDTO();
		dto.setTransactionId(transaction.getTransactionId());
		dto.setOrderId(transaction.getOrderId());
		dto.setGatewayOrderId(transaction.getGatewayOrderId());
		dto.setGatewayPaymentId(transaction.getGatewayPaymentId());
		dto.setAmount(transaction.getAmount());
		dto.setCurrency(transaction.getCurrency());
		dto.setStatus(transaction.getStatus().name());
		dto.setRazorpayKeyId(razorpayKeyId);
		return dto;
	}

}
