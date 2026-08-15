package com.infy.ekart.payment.service;

import com.infy.ekart.payment.dto.PaymentTransactionDTO;
import com.infy.ekart.payment.dto.VerifyPaymentRequestDTO;
import com.infy.ekart.payment.exception.EKartPaymentException;

public interface PaymentService {

	PaymentTransactionDTO createPaymentOrder(String customerEmailId, Integer orderId) throws EKartPaymentException;

	PaymentTransactionDTO verifyPayment(String customerEmailId, VerifyPaymentRequestDTO request)
			throws EKartPaymentException;

}
