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

		ResponseEntity<CartProductDTO[]> cartProductDTOsResponse = template.getForEntity(
				"http://localhost:3335/Ekart/customercart-api/customer/" + order.getCustomerEmailId() + "/products",
				CartProductDTO[].class);
		CartProductDTO[] cartProductDTOs = cartProductDTOsResponse.getBody();

		template.delete("http://localhost:3335/Ekart/customercart-api/customer/" + order.getCustomerEmailId() + "/products");

		List<OrderedProductDTO> orderedProductDTOs = new ArrayList<>();
		for (CartProductDTO cartProductDTO : cartProductDTOs) {
			OrderedProductDTO orderedProductDTO = new OrderedProductDTO();
			orderedProductDTO.setProduct(cartProductDTO.getProduct());
			orderedProductDTO.setQuantity(cartProductDTO.getQuantity());
			orderedProductDTOs.add(orderedProductDTO);
		}
		order.setOrderedProducts(orderedProductDTOs);

		Integer orderId = orderService.placeOrder(order);

		// Stock is reserved at placement time (not at payment confirmation) so two customers
		// can't both "buy" the last item while one payment is still pending.
		for (OrderedProductDTO orderedProductDTO : orderedProductDTOs) {
			template.put(
					"http://localhost:3334/Ekart/product-api/update/" + orderedProductDTO.getProduct().getProductId(),
					orderedProductDTO.getQuantity());
		}

		String modificationSuccessMsg = environment.getProperty("OrderAPI.ORDER_PLACED_SUCCESSFULLY");

		return new ResponseEntity<>(modificationSuccessMsg + orderId, HttpStatus.CREATED);
	}

	@GetMapping(value = "order/{orderId}")
	public ResponseEntity<OrderDTO> getOrderDetails(
			@NotNull(message = "{orderId.absent}") @PathVariable Integer orderId) throws EKartCustomerException {
		OrderDTO orderDTO = orderService.getOrderDetails(orderId);
		enrichWithProductDetails(orderDTO);
		return new ResponseEntity<>(orderDTO, HttpStatus.OK);
	}

	@GetMapping(value = "customer/{customerEmailId}/orders")
	public ResponseEntity<List<OrderDTO>> getOrdersOfCustomer(
			@Pattern(regexp = "[a-zA-Z0-9._]+@[a-zA-Z]{2,}\\.[a-zA-Z][a-zA-Z.]+", message = "{invalid.email.format}") @PathVariable String customerEmailId)
			throws EKartCustomerException {
		List<OrderDTO> orderDTOs = orderService.findOrdersByCustomerEmailId(customerEmailId);
		for (OrderDTO orderDTO : orderDTOs) {
			enrichWithProductDetails(orderDTO);
		}
		return new ResponseEntity<>(orderDTOs, HttpStatus.OK);
	}

	@GetMapping(value = "order/{orderId}/status-history")
	public ResponseEntity<List<OrderStatusHistoryDTO>> getOrderStatusHistory(
			@NotNull(message = "{orderId.absent}") @PathVariable Integer orderId) throws EKartCustomerException {
		return new ResponseEntity<>(orderService.getOrderStatusHistory(orderId), HttpStatus.OK);
	}

	@PutMapping(value = "order/{orderId}/update/order-status")
	public void updateOrderAfterPayment(@NotNull(message = "{orderId.absent}") @PathVariable Integer orderId,
			@RequestBody String transactionStatus) throws EKartCustomerException {
		// @RequestBody String reads the raw request body as-is (Spring's StringHttpMessageConverter
		// wins over Jackson for a String target type), so a JSON string literal like
		// "TRANSACTION_SUCCESS" arrives here still wrapped in quotes — strip them before comparing.
		transactionStatus = transactionStatus.replace("\"", "").trim();
		// Stock was already reserved at order-placement time (see placeOrder), so this callback
		// only needs to move the order's status — a failed online payment does not currently
		// release the reserved stock back to inventory (a reconciliation job would handle that).
		if (transactionStatus.equals("TRANSACTION_SUCCESS")) {
			orderService.updateOrderStatus(orderId, OrderStatus.CONFIRMED, "SYSTEM", "Payment confirmed");
		} else {
			orderService.updateOrderStatus(orderId, OrderStatus.CANCELLED, "SYSTEM", "Payment failed");
		}
	}

	@PostMapping(value = "order/{orderId}/reorder")
	public ResponseEntity<String> reorder(@NotNull(message = "{orderId.absent}") @PathVariable Integer orderId)
			throws EKartCustomerException {
		OrderDTO orderDTO = orderService.getOrderDetails(orderId);

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

	private void enrichWithProductDetails(OrderDTO orderDTO) {
		for (OrderedProductDTO orderedProductDTO : orderDTO.getOrderedProducts()) {
			ResponseEntity<ProductDTO> productResponse = template.getForEntity(
					"http://localhost:3334/Ekart/product-api/product/" + orderedProductDTO.getProduct().getProductId(),
					ProductDTO.class);
			orderedProductDTO.setProduct(productResponse.getBody());
		}
	}

}
