package com.infy.ekart.customer.api;

import java.util.List;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.infy.ekart.customer.dto.AdminOrderStatusUpdateDTO;
import com.infy.ekart.customer.dto.OrderDTO;
import com.infy.ekart.customer.dto.OrderStatus;
import com.infy.ekart.customer.dto.OrderedProductDTO;
import com.infy.ekart.customer.dto.ProductDTO;
import com.infy.ekart.customer.dto.PaymentStatus;
import com.infy.ekart.customer.exception.EKartCustomerException;
import com.infy.ekart.customer.service.OrderService;
import com.infy.ekart.customer.service.CustomerService;
import com.infy.ekart.customer.dto.CustomerDTO;

@RestController
@RequestMapping("/admin-api/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderAPI {
	@Autowired private OrderService orderService;
	@Autowired private RestTemplate template;
	@Autowired private CustomerService customerService;

	@GetMapping
	public ResponseEntity<List<OrderDTO>> getAllOrders() throws EKartCustomerException {
		List<OrderDTO> orders = orderService.findAllOrders();
		orders.forEach(order -> { enrichCustomer(order); enrichWithProductDetails(order); });
		return new ResponseEntity<>(orders, HttpStatus.OK);
	}

	@PutMapping("/{orderId}/status")
	public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Integer orderId,
			@Valid @RequestBody AdminOrderStatusUpdateDTO update) throws EKartCustomerException {
		OrderDTO current = orderService.getOrderDetails(orderId);
		OrderStatus next = update.getStatus();
		if (next == OrderStatus.CANCELLED && current.getPaymentStatus() != null
				&& PaymentStatus.PAID.name().equals(current.getPaymentStatus())) {
			return new ResponseEntity<>(HttpStatus.CONFLICT);
		}
		if (next == OrderStatus.CANCELLED && OrderStatus.CANCELLED.name().equals(current.getOrderStatus())) {
			template.put("http://localhost:3334/Ekart/product-api/orders/" + orderId + "/release", null);
			return new ResponseEntity<>(current, HttpStatus.OK);
		}
		if (next == OrderStatus.CANCELLED && (update.getNote() == null || update.getNote().trim().isEmpty())) {
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
		if (!isAllowedTransition(OrderStatus.valueOf(current.getOrderStatus()), next, current.getDeliveryType())) {
			return new ResponseEntity<>(HttpStatus.CONFLICT);
		}
		String actor = String.valueOf(SecurityContextHolder.getContext().getAuthentication().getPrincipal());
		orderService.updateOrderStatus(orderId, next, actor,
				update.getNote() == null ? "Updated by shopkeeper" : update.getNote());
		if (next == OrderStatus.CANCELLED) {
			orderService.updatePaymentStatus(orderId, PaymentStatus.CANCELLED, actor, update.getNote());
			template.put("http://localhost:3334/Ekart/product-api/orders/" + orderId + "/release", null);
		}
		if (next == OrderStatus.DELIVERED && "COD".equals(current.getPaymentThrough())) {
			orderService.updatePaymentStatus(orderId, PaymentStatus.PAID, actor, "COD collected at handoff");
		}
		OrderDTO updated = orderService.getOrderDetails(orderId);
		enrichCustomer(updated);
		enrichWithProductDetails(updated);
		return new ResponseEntity<>(updated, HttpStatus.OK);
	}

	private void enrichCustomer(OrderDTO order) {
		try {
			CustomerDTO customer = customerService.getCustomerByEmailId(order.getCustomerEmailId());
			order.setCustomerName(customer.getName());
			order.setCustomerPhoneNumber(customer.getPhoneNumber());
		} catch (EKartCustomerException missingCustomer) {
			order.setCustomerName("Customer account unavailable");
		}
	}

	private boolean isAllowedTransition(OrderStatus current, OrderStatus next, String deliveryType) {
		if (current == OrderStatus.PLACED) return next == OrderStatus.CONFIRMED || next == OrderStatus.CANCELLED;
		if (current == OrderStatus.CONFIRMED) return next == OrderStatus.PREPARING;
		if (current == OrderStatus.PREPARING) return next == OrderStatus.READY_FOR_PICKUP;
		if (current == OrderStatus.READY_FOR_PICKUP && "PICKUP".equals(deliveryType)) return next == OrderStatus.DELIVERED;
		if (current == OrderStatus.READY_FOR_PICKUP && "DELIVERY".equals(deliveryType)) return next == OrderStatus.OUT_FOR_DELIVERY;
		if (current == OrderStatus.OUT_FOR_DELIVERY && "DELIVERY".equals(deliveryType)) return next == OrderStatus.DELIVERED;
		return false;
	}

	private void enrichWithProductDetails(OrderDTO order) {
		for (OrderedProductDTO item : order.getOrderedProducts()) {
			Integer productId = item.getProduct().getProductId();
			if (item.getProduct().getName() != null) continue;
			try {
				ProductDTO product = template.getForObject("http://localhost:3334/Ekart/product-api/products/" + productId + "/historical",
						ProductDTO.class);
				if (product != null) item.setProduct(product);
			} catch (org.springframework.web.client.HttpClientErrorException.NotFound missingProduct) {
				ProductDTO historicalProduct = new ProductDTO();
				historicalProduct.setProductId(productId);
				historicalProduct.setName("Catalogue item unavailable");
				item.setProduct(historicalProduct);
			}
		}
	}
}
