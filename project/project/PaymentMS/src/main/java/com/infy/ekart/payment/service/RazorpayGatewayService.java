package com.infy.ekart.payment.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.infy.ekart.payment.exception.EKartPaymentException;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

/**
 * Thin wrapper around the Razorpay Java SDK. Card/UPI details never pass through here or
 * any of our servers — the frontend collects them directly inside Razorpay's Checkout
 * widget, and we only ever see gateway-issued reference IDs.
 */
@Service
public class RazorpayGatewayService {

	@Value("${razorpay.key-id}")
	private String keyId;

	@Value("${razorpay.key-secret}")
	private String keySecret;

	public String getKeyId() {
		return keyId;
	}

	/**
	 * Creates an order on Razorpay's side for the given amount, returning its gateway order
	 * id. The frontend uses this id to open the Checkout widget; the customer never sees or
	 * enters payment details on our domain.
	 */
	public String createOrder(Integer internalOrderId, double amountInRupees) throws EKartPaymentException {
		try {
			RazorpayClient client = new RazorpayClient(keyId, keySecret);

			JSONObject orderRequest = new JSONObject();
			// Razorpay amounts are in the smallest currency unit (paise for INR).
			orderRequest.put("amount", Math.round(amountInRupees * 100));
			orderRequest.put("currency", "INR");
			orderRequest.put("receipt", "mithai-junction-order-" + internalOrderId);

			Order order = client.orders.create(orderRequest);
			return order.get("id");
		} catch (RazorpayException e) {
			throw new EKartPaymentException("PaymentService.GATEWAY_ORDER_CREATION_FAILED", HttpStatus.SERVICE_UNAVAILABLE, e);
		}
	}

	/**
	 * Verifies that a (gatewayOrderId, gatewayPaymentId, signature) triple returned by the
	 * Checkout widget was genuinely signed by Razorpay with our key secret, per Razorpay's
	 * documented algorithm: HMAC-SHA256("{order_id}|{payment_id}", key_secret), hex-encoded.
	 */
	public boolean verifySignature(String gatewayOrderId, String gatewayPaymentId, String signature) {
		try {
			String payload = gatewayOrderId + "|" + gatewayPaymentId;
			Mac mac = Mac.getInstance("HmacSHA256");
			mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
			byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));

			StringBuilder hex = new StringBuilder();
			for (byte b : hash) {
				hex.append(String.format("%02x", b));
			}

			return hex.toString().equals(signature);
		} catch (Exception e) {
			return false;
		}
	}

}
