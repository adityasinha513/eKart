package com.infy.ekart.customer.api;

import java.util.ArrayList;
import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.infy.ekart.customer.dto.CartProductDTO;
import com.infy.ekart.customer.dto.CustomerCartDTO;
import com.infy.ekart.customer.dto.OrderDTO;
import com.infy.ekart.customer.dto.OrderStatus;
import com.infy.ekart.customer.dto.OrderStatusHistoryDTO;
import com.infy.ekart.customer.dto.OrderedProductDTO;
import com.infy.ekart.customer.dto.ProductDTO;
import com.infy.ekart.customer.dto.PaymentStatus;
import com.infy.ekart.customer.exception.EKartCustomerException;
import com.infy.ekart.customer.service.OrderService;

@CrossOrigin
@RequestMapping(value = "/customerorder-api")
@RestController
@Validated
public class OrderAPI {

	@Autowired
	private OrderService orderService;

	@Autowired
	private Environment environment;

	@Autowired
	private RestTemplate template;

	@PostMapping(value = "/place-order")
	public ResponseEntity<String> placeOrder(@Valid @RequestBody OrderDTO order) throws EKartCustomerException {
		String authenticatedEmail = currentUser();
		order.setCustomerEmailId(authenticatedEmail);

		ResponseEntity<CartProductDTO[]> cartProductDTOsResponse = template.getForEntity(
				"http://localhost:3335/Ekart/customercart-api/customer/" + order.getCustomerEmailId() + "/products",
				CartProductDTO[].class);
		CartProductDTO[] cartProductDTOs = cartProductDTOsResponse.getBody();
		if (cartProductDTOs == null || cartProductDTOs.length == 0) {
			return new ResponseEntity<>("Your cart is empty.", HttpStatus.BAD_REQUEST);
		}

		List<OrderedProductDTO> orderedProductDTOs = new ArrayList<>();
		for (CartProductDTO cartProductDTO : cartProductDTOs) {
			OrderedProductDTO orderedProductDTO = new OrderedProductDTO();
			ProductDTO currentProduct = template.getForObject(
					"http://localhost:3334/Ekart/product-api/product/" + cartProductDTO.getProduct().getProductId(),
					ProductDTO.class);
			if (currentProduct == null || !currentProduct.isAvailable()
					|| currentProduct.getAvailableQuantity() == null
					|| currentProduct.getAvailableQuantity() < cartProductDTO.getQuantity()) {
				throw new EKartCustomerException("OrderService.INSUFFICIENT_STOCK");
			}
			orderedProductDTO.setProduct(currentProduct);
			orderedProductDTO.setQuantity(cartProductDTO.getQuantity());
			orderedProductDTOs.add(orderedProductDTO);
		}
		order.setOrderedProducts(orderedProductDTOs);

		Integer orderId = orderService.placeOrder(order);
		java.util.Map<String, Object> reservation = new java.util.LinkedHashMap<>();
		reservation.put("orderId", orderId);
		List<java.util.Map<String, Object>> reservationItems = new ArrayList<>();
		for (OrderedProductDTO item : orderedProductDTOs) {
			java.util.Map<String, Object> reservationItem = new java.util.LinkedHashMap<>();
			reservationItem.put("productId", item.getProduct().getProductId());
			reservationItem.put("quantity", item.getQuantity());
			reservationItems.add(reservationItem);
		}
		reservation.put("items", reservationItems);
		try {
			template.postForEntity("http://localhost:3334/Ekart/product-api/orders/" + orderId + "/reserve",
					reservation, Void.class);
		} catch (org.springframework.web.client.RestClientException reservationFailure) {
			orderService.updatePaymentStatus(orderId, PaymentStatus.CANCELLED, "SYSTEM", "Inventory reservation failed");
			throw new EKartCustomerException("OrderService.INSUFFICIENT_STOCK");
		}
		template.delete("http://localhost:3335/Ekart/customercart-api/customer/" + order.getCustomerEmailId() + "/products");

		String modificationSuccessMsg = environment.getProperty("OrderAPI.ORDER_PLACED_SUCCESSFULLY");

		return new ResponseEntity<>(modificationSuccessMsg + orderId, HttpStatus.CREATED);
	}

	@GetMapping(value = "order/{orderId}")
	public ResponseEntity<OrderDTO> getOrderDetails(
			@NotNull(message = "{orderId.absent}") @PathVariable Integer orderId) throws EKartCustomerException {
		OrderDTO orderDTO = orderService.getOrderDetails(orderId);
		String authenticatedEmail = currentUserOrNull();
		if (authenticatedEmail != null && !hasRole("ADMIN") && !authenticatedEmail.equalsIgnoreCase(orderDTO.getCustomerEmailId())) {
			return new ResponseEntity<>(HttpStatus.FORBIDDEN);
		}
		enrichWithProductDetails(orderDTO);
		return new ResponseEntity<>(orderDTO, HttpStatus.OK);
	}

	@GetMapping(value = "customer/{customerEmailId}/orders")
	public ResponseEntity<List<OrderDTO>> getOrdersOfCustomer(
			@Pattern(regexp = "[a-zA-Z0-9._]+@[a-zA-Z]{2,}\\.[a-zA-Z][a-zA-Z.]+", message = "{invalid.email.format}") @PathVariable String customerEmailId)
			throws EKartCustomerException {
		if (!currentUser().equalsIgnoreCase(customerEmailId)) return new ResponseEntity<>(HttpStatus.FORBIDDEN);
		List<OrderDTO> orderDTOs = orderService.findOrdersByCustomerEmailId(customerEmailId);
		for (OrderDTO orderDTO : orderDTOs) {
			enrichWithProductDetails(orderDTO);
		}
		return new ResponseEntity<>(orderDTOs, HttpStatus.OK);
	}

	@GetMapping(value = "order/{orderId}/status-history")
	public ResponseEntity<List<OrderStatusHistoryDTO>> getOrderStatusHistory(
			@NotNull(message = "{orderId.absent}") @PathVariable Integer orderId) throws EKartCustomerException {
		OrderDTO order = orderService.getOrderDetails(orderId);
		if (!hasRole("ADMIN") && !currentUser().equalsIgnoreCase(order.getCustomerEmailId())) return new ResponseEntity<>(HttpStatus.FORBIDDEN);
		return new ResponseEntity<>(orderService.getOrderStatusHistory(orderId), HttpStatus.OK);
	}

	@PutMapping(value = "order/{orderId}/cancel")
	public ResponseEntity<Void> cancelOwnOrder(@PathVariable Integer orderId) throws EKartCustomerException {
		OrderDTO order = orderService.getOrderDetails(orderId);
		if (!currentUser().equalsIgnoreCase(order.getCustomerEmailId())) return new ResponseEntity<>(HttpStatus.FORBIDDEN);
		if (OrderStatus.CANCELLED.name().equals(order.getOrderStatus())) {
			template.put("http://localhost:3334/Ekart/product-api/orders/" + orderId + "/release", null);
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		}
		if (!OrderStatus.PLACED.name().equals(order.getOrderStatus()) || PaymentStatus.PAID.name().equals(order.getPaymentStatus())) {
			return new ResponseEntity<>(HttpStatus.CONFLICT);
		}
		orderService.updateOrderStatus(orderId, OrderStatus.CANCELLED, currentUser(), "Cancelled by customer");
		if (PaymentStatus.PENDING.name().equals(order.getPaymentStatus())) {
			orderService.updatePaymentStatus(orderId, PaymentStatus.CANCELLED, currentUser(), "Cancelled by customer");
		}
		template.put("http://localhost:3334/Ekart/product-api/orders/" + orderId + "/release", null);
		return new ResponseEntity<>(HttpStatus.NO_CONTENT);
	}

	@PutMapping(value = "order/{orderId}/update/order-status")
	public ResponseEntity<Void> updateOrderAfterPayment(@NotNull(message = "{orderId.absent}") @PathVariable Integer orderId,
			@RequestBody String transactionStatus) throws EKartCustomerException {
		if (currentUserOrNull() != null) return new ResponseEntity<>(HttpStatus.FORBIDDEN);
		// @RequestBody String reads the raw request body as-is (Spring's StringHttpMessageConverter
		// wins over Jackson for a String target type), so a JSON string literal like
		// "TRANSACTION_SUCCESS" arrives here still wrapped in quotes — strip them before comparing.
		transactionStatus = transactionStatus.replace("\"", "").trim();
		if (transactionStatus.equals("TRANSACTION_SUCCESS")) {
			orderService.updatePaymentStatus(orderId, PaymentStatus.PAID, "SYSTEM", "Payment confirmed");
		} else if (transactionStatus.equals("TRANSACTION_CANCELLED")) {
			orderService.updatePaymentStatus(orderId, PaymentStatus.CANCELLED, "SYSTEM", "Payment cancelled");
			template.put("http://localhost:3334/Ekart/product-api/orders/" + orderId + "/release", null);
		} else {
			orderService.updatePaymentStatus(orderId, PaymentStatus.FAILED, "SYSTEM", "Payment failed");
			template.put("http://localhost:3334/Ekart/product-api/orders/" + orderId + "/release", null);
		}
		return new ResponseEntity<>(HttpStatus.NO_CONTENT);
	}

	@PostMapping(value = "order/{orderId}/reorder")
	public ResponseEntity<String> reorder(@NotNull(message = "{orderId.absent}") @PathVariable Integer orderId)
			throws EKartCustomerException {
		OrderDTO orderDTO = orderService.getOrderDetails(orderId);
		if (!currentUser().equalsIgnoreCase(orderDTO.getCustomerEmailId())) return new ResponseEntity<>(HttpStatus.FORBIDDEN);

		CustomerCartDTO customerCartDTO = new CustomerCartDTO();
		customerCartDTO.setCustomerEmailId(orderDTO.getCustomerEmailId());

		java.util.Set<CartProductDTO> cartProductDTOs = new java.util.HashSet<>();
		for (OrderedProductDTO orderedProductDTO : orderDTO.getOrderedProducts()) {
			CartProductDTO cartProductDTO = new CartProductDTO();
			ProductDTO productDTO = new ProductDTO();
			productDTO.setProductId(orderedProductDTO.getProduct().getProductId());
			cartProductDTO.setProduct(productDTO);
			cartProductDTO.setQuantity(orderedProductDTO.getQuantity());
			cartProductDTOs.add(cartProductDTO);
		}
		customerCartDTO.setCartProducts(cartProductDTOs);

		template.postForEntity("http://localhost:3335/Ekart/customercart-api/products", customerCartDTO, String.class);

		return new ResponseEntity<>(environment.getProperty("OrderAPI.REORDER_SUCCESS"), HttpStatus.OK);
	}

	private String currentUser() {
		String user = currentUserOrNull();
		if (user == null) throw new org.springframework.security.access.AccessDeniedException("Authenticated customer is required.");
		return user;
	}

	private String currentUserOrNull() {
		org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || authentication instanceof org.springframework.security.authentication.AnonymousAuthenticationToken
				|| "anonymousUser".equals(authentication.getPrincipal())) return null;
		return !(authentication.getPrincipal() instanceof String) ? null : (String) authentication.getPrincipal();
	}

	private boolean hasRole(String role) {
		org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
		return authentication != null && authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
	}

	private void enrichWithProductDetails(OrderDTO orderDTO) {
		for (OrderedProductDTO orderedProductDTO : orderDTO.getOrderedProducts()) {
			Integer productId = orderedProductDTO.getProduct().getProductId();
			if (orderedProductDTO.getProduct().getName() != null) continue;
			try {
				ProductDTO product = template.getForObject("http://localhost:3334/Ekart/product-api/products/" + productId + "/historical",
						ProductDTO.class);
				if (product != null) orderedProductDTO.setProduct(product);
			} catch (org.springframework.web.client.HttpClientErrorException.NotFound missingProduct) {
				ProductDTO historicalProduct = new ProductDTO();
				historicalProduct.setProductId(productId);
				historicalProduct.setName("Catalogue item unavailable");
				orderedProductDTO.setProduct(historicalProduct);
			}
		}
	}

}
