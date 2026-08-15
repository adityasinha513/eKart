package com.infy.ekart.customer.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infy.ekart.customer.dto.DeliveryType;
import com.infy.ekart.customer.dto.OrderDTO;
import com.infy.ekart.customer.dto.OrderStatus;
import com.infy.ekart.customer.dto.OrderStatusHistoryDTO;
import com.infy.ekart.customer.dto.OrderedProductDTO;
import com.infy.ekart.customer.dto.PaymentThrough;
import com.infy.ekart.customer.dto.ProductDTO;
import com.infy.ekart.customer.entity.Address;
import com.infy.ekart.customer.entity.Order;
import com.infy.ekart.customer.entity.OrderStatusHistory;
import com.infy.ekart.customer.entity.OrderedProduct;
import com.infy.ekart.customer.exception.EKartCustomerException;
import com.infy.ekart.customer.repository.AddressRepository;
import com.infy.ekart.customer.repository.OrderRepository;
import com.infy.ekart.customer.repository.OrderStatusHistoryRepository;

@Service(value = "orderService")
@Transactional
public class OrderServiceImpl implements OrderService {

	@Autowired
	private OrderRepository orderRepository;

	@Autowired
	private AddressRepository addressRepository;

	@Autowired
	private OrderStatusHistoryRepository historyRepository;

	@Value("${mithai-junction.pickup-store-location}")
	private String pickupStoreLocation;

	@Override
	public Integer placeOrder(OrderDTO orderDTO) throws EKartCustomerException {
		DeliveryType deliveryType = DeliveryType.valueOf(orderDTO.getDeliveryType());

		Order order = new Order();
		order.setCustomerEmailId(orderDTO.getCustomerEmailId());
		order.setDeliveryType(deliveryType);

		if (deliveryType == DeliveryType.DELIVERY) {
			if (orderDTO.getAddressId() == null) {
				throw new EKartCustomerException("OrderService.ADDRESS_NOT_AVAILABLE");
			}
			Address address = addressRepository.findById(orderDTO.getAddressId())
					.filter(a -> a.getCustomerEmailId().equalsIgnoreCase(orderDTO.getCustomerEmailId()))
					.orElseThrow(() -> new EKartCustomerException("AddressService.ADDRESS_NOT_FOUND"));
			order.setAddressId(address.getAddressId());
			order.setDeliveryAddressSnapshot(address.toDisplayString());
		} else {
			order.setPickupStoreLocation(pickupStoreLocation);
		}

		order.setDateOfDelivery(orderDTO.getDateOfDelivery());
		order.setDateOfOrder(LocalDateTime.now());
		order.setPaymentThrough(PaymentThrough.valueOf(orderDTO.getPaymentThrough()));
		order.setOrderStatus(OrderStatus.PLACED);

		double subtotal = 0.0;
		double totalDiscount = 0.0;
		List<OrderedProduct> orderedProducts = new ArrayList<>();

		for (OrderedProductDTO orderedProductDTO : orderDTO.getOrderedProducts()) {
			ProductDTO product = orderedProductDTO.getProduct();
			if (product.getAvailableQuantity() < orderedProductDTO.getQuantity()) {
				throw new EKartCustomerException("OrderService.INSUFFICIENT_STOCK");
			}

			double unitPrice = product.getDiscountedPrice() != null ? product.getDiscountedPrice() : product.getPrice();
			totalDiscount += (product.getPrice() - unitPrice) * orderedProductDTO.getQuantity();
			subtotal += unitPrice * orderedProductDTO.getQuantity();

			OrderedProduct orderedProduct = new OrderedProduct();
			orderedProduct.setProductId(product.getProductId());
			orderedProduct.setQuantity(orderedProductDTO.getQuantity());
			orderedProduct.setUnitPrice(unitPrice);
			orderedProducts.add(orderedProduct);
		}

		order.setOrderedProducts(orderedProducts);
		order.setDiscount(totalDiscount);
		order.setTotalPrice(subtotal);

		orderRepository.save(order);
		appendHistory(order.getOrderId(), OrderStatus.PLACED, order.getCustomerEmailId(), "Order placed");

		// COD orders have no payment step to wait for, so they're confirmed immediately.
		// ONLINE orders stay PLACED until PaymentMS calls updateOrderStatus after checkout.
		if (order.getPaymentThrough() == PaymentThrough.COD) {
			order.setOrderStatus(OrderStatus.CONFIRMED);
			appendHistory(order.getOrderId(), OrderStatus.CONFIRMED, "SYSTEM",
					"Cash on Delivery — order auto-confirmed");
		}

		return order.getOrderId();
	}

	@Override
	public OrderDTO getOrderDetails(Integer orderId) throws EKartCustomerException {
		return mapToDTO(findOrderOrThrow(orderId));
	}

	@Override
	public List<OrderDTO> findOrdersByCustomerEmailId(String emailId) throws EKartCustomerException {
		List<Order> orders = orderRepository.findByCustomerEmailId(emailId);
		if (orders.isEmpty()) {
			throw new EKartCustomerException("OrderService.NO_ORDERS_FOUND");
		}
		List<OrderDTO> orderDTOs = new ArrayList<>();
		for (Order order : orders) {
			orderDTOs.add(mapToDTO(order));
		}
		return orderDTOs;
	}

	@Override
	public void updateOrderStatus(Integer orderId, OrderStatus orderStatus, String changedBy, String note)
			throws EKartCustomerException {
		Order order = findOrderOrThrow(orderId);
		order.setOrderStatus(orderStatus);
		appendHistory(orderId, orderStatus, changedBy, note);
	}

	@Override
	public List<OrderStatusHistoryDTO> getOrderStatusHistory(Integer orderId) throws EKartCustomerException {
		findOrderOrThrow(orderId);
		return historyRepository.findByOrderIdOrderByChangedAtAsc(orderId).stream()
				.map(this::mapHistoryToDTO)
				.collect(Collectors.toList());
	}

	private void appendHistory(Integer orderId, OrderStatus status, String changedBy, String note) {
		OrderStatusHistory history = new OrderStatusHistory();
		history.setOrderId(orderId);
		history.setStatus(status);
		history.setChangedAt(LocalDateTime.now());
		history.setChangedBy(changedBy);
		history.setNote(note);
		historyRepository.save(history);
	}

	private Order findOrderOrThrow(Integer orderId) throws EKartCustomerException {
		return orderRepository.findById(orderId)
				.orElseThrow(() -> new EKartCustomerException("OrderService.ORDER_NOT_FOUND"));
	}

	private OrderDTO mapToDTO(Order order) {
		OrderDTO orderDTO = new OrderDTO();
		orderDTO.setOrderId(order.getOrderId());
		orderDTO.setCustomerEmailId(order.getCustomerEmailId());
		orderDTO.setDateOfDelivery(order.getDateOfDelivery());
		orderDTO.setDateOfOrder(order.getDateOfOrder());
		orderDTO.setPaymentThrough(order.getPaymentThrough().toString());
		orderDTO.setTotalPrice(order.getTotalPrice());
		orderDTO.setOrderStatus(order.getOrderStatus().toString());
		orderDTO.setDiscount(order.getDiscount());
		orderDTO.setDeliveryType(order.getDeliveryType().toString());
		orderDTO.setAddressId(order.getAddressId());
		orderDTO.setDeliveryAddressSnapshot(order.getDeliveryAddressSnapshot());
		orderDTO.setPickupStoreLocation(order.getPickupStoreLocation());

		List<OrderedProductDTO> orderedProductDTOs = new ArrayList<>();
		for (OrderedProduct orderedProduct : order.getOrderedProducts()) {
			OrderedProductDTO orderedProductDTO = new OrderedProductDTO();
			ProductDTO productDTO = new ProductDTO();
			productDTO.setProductId(orderedProduct.getProductId());
			orderedProductDTO.setOrderedProductId(orderedProduct.getOrderedProductId());
			orderedProductDTO.setQuantity(orderedProduct.getQuantity());
			orderedProductDTO.setUnitPrice(orderedProduct.getUnitPrice());
			orderedProductDTO.setProduct(productDTO);
			orderedProductDTOs.add(orderedProductDTO);
		}
		orderDTO.setOrderedProducts(orderedProductDTOs);

		orderDTO.setStatusHistory(historyRepository.findByOrderIdOrderByChangedAtAsc(order.getOrderId()).stream()
				.map(this::mapHistoryToDTO)
				.collect(Collectors.toList()));

		return orderDTO;
	}

	private OrderStatusHistoryDTO mapHistoryToDTO(OrderStatusHistory history) {
		OrderStatusHistoryDTO dto = new OrderStatusHistoryDTO();
		dto.setStatus(history.getStatus().toString());
		dto.setChangedAt(history.getChangedAt());
		dto.setChangedBy(history.getChangedBy());
		dto.setNote(history.getNote());
		return dto;
	}

}
