package com.infy.ekart.customer.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.client.RestTemplate;

import com.infy.ekart.customer.dto.DeliveryType;
import com.infy.ekart.customer.dto.OrderDTO;
import com.infy.ekart.customer.dto.OrderStatus;
import com.infy.ekart.customer.dto.OrderStatusHistoryDTO;
import com.infy.ekart.customer.dto.OrderedProductDTO;
import com.infy.ekart.customer.dto.PaymentThrough;
import com.infy.ekart.customer.dto.PaymentStatus;
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

	@Autowired private RestTemplate restTemplate;

	@Value("${mithai-junction.pickup-store-location}")
	private String pickupStoreLocation;

	@Value("${delivery.store.latitude:12.9756}")
	private double storeLatitude;

	@Value("${delivery.store.longitude:77.6066}")
	private double storeLongitude;

	@Value("${delivery.radius-km:20}")
	private double deliveryRadiusKm;

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
			if (address.getLatitude() == null || address.getLongitude() == null) {
				throw new EKartCustomerException("OrderService.ADDRESS_LOCATION_REQUIRED");
			}
			if (distanceKm(storeLatitude, storeLongitude, address.getLatitude(), address.getLongitude()) > deliveryRadiusKm) {
				throw new EKartCustomerException("OrderService.OUTSIDE_DELIVERY_AREA");
			}
			order.setAddressId(address.getAddressId());
			order.setDeliveryAddressSnapshot(address.toDisplayString());
		} else {
			order.setPickupStoreLocation(pickupStoreLocation);
		}

		order.setDateOfDelivery(orderDTO.getDateOfDelivery());
		order.setDateOfOrder(LocalDateTime.now());
		order.setPaymentThrough(PaymentThrough.valueOf(orderDTO.getPaymentThrough()));
		order.setPaymentStatus(PaymentStatus.PENDING);
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
			orderedProduct.setProductNameSnapshot(product.getName());
			orderedProduct.setDescriptionSnapshot(product.getDescription());
			orderedProduct.setImageUrlSnapshot(product.getImageUrl());
			orderedProduct.setCategorySnapshot(product.getCategory());
			orderedProduct.setUnitSnapshot(product.getUnit());
			orderedProduct.setUnitQuantitySnapshot(product.getUnitQuantity());
			orderedProducts.add(orderedProduct);
		}

		order.setOrderedProducts(orderedProducts);
		order.setDiscount(totalDiscount);
		double deliveryFee = deliveryType == DeliveryType.DELIVERY && subtotal > 0 && subtotal < 499 ? 40.0 : 0.0;
		order.setDeliveryFee(deliveryFee);
		order.setTotalPrice(subtotal + deliveryFee);

		orderRepository.save(order);
		appendHistory(order.getOrderId(), OrderStatus.PLACED, order.getCustomerEmailId(), "Order placed");

		return order.getOrderId();
	}

	private double distanceKm(double latitude1, double longitude1, double latitude2, double longitude2) {
		double earthRadiusKm = 6371.0088;
		double dLat = Math.toRadians(latitude2 - latitude1);
		double dLon = Math.toRadians(longitude2 - longitude1);
		double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
				+ Math.cos(Math.toRadians(latitude1)) * Math.cos(Math.toRadians(latitude2))
				* Math.sin(dLon / 2) * Math.sin(dLon / 2);
		return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	}

	@Override
	public OrderDTO getOrderDetails(Integer orderId) throws EKartCustomerException {
		return mapToDTO(findOrderOrThrow(orderId));
	}

	@Override
	public List<OrderDTO> findOrdersByCustomerEmailId(String emailId) throws EKartCustomerException {
		List<Order> orders = orderRepository.findByCustomerEmailId(emailId);
		List<OrderDTO> orderDTOs = new ArrayList<>();
		for (Order order : orders) {
			orderDTOs.add(mapToDTO(order));
		}
		return orderDTOs;
	}

	@Override
	public List<OrderDTO> findAllOrders() {
		return orderRepository.findAllByOrderByDateOfOrderDesc().stream()
				.map(this::mapToDTO)
				.collect(Collectors.toList());
	}

	@Override
	public void updateOrderStatus(Integer orderId, OrderStatus orderStatus, String changedBy, String note)
			throws EKartCustomerException {
		Order order = findOrderOrThrow(orderId);
		order.setOrderStatus(orderStatus);
		appendHistory(orderId, orderStatus, changedBy, note);
	}

	@Override
	public void updatePaymentStatus(Integer orderId, PaymentStatus status, String changedBy, String note)
			throws EKartCustomerException {
		Order order = findOrderOrThrow(orderId);
		PaymentStatus current = order.getPaymentStatus();
		if (current == status) return;
		if (current != PaymentStatus.PENDING) {
			throw new EKartCustomerException("OrderService.PAYMENT_ALREADY_FINAL");
		}
		order.setPaymentStatus(status);
		if ((status == PaymentStatus.FAILED || status == PaymentStatus.CANCELLED)
				&& order.getOrderStatus() == OrderStatus.PLACED) {
			order.setOrderStatus(OrderStatus.CANCELLED);
			appendHistory(orderId, OrderStatus.CANCELLED, changedBy, note);
		}
	}

	@Scheduled(fixedDelayString = "${orders.payment-expiry-check-ms:60000}")
	public void expireUnpaidOnlineOrders() {
		LocalDateTime expiry = LocalDateTime.now().minusMinutes(15);
		List<Order> expired = orderRepository.findByPaymentThroughAndPaymentStatusAndOrderStatusAndDateOfOrderBefore(
				PaymentThrough.ONLINE, PaymentStatus.PENDING, OrderStatus.PLACED, expiry);
		for (Order order : expired) {
			order.setPaymentStatus(PaymentStatus.CANCELLED);
			order.setOrderStatus(OrderStatus.CANCELLED);
			appendHistory(order.getOrderId(), OrderStatus.CANCELLED, "SYSTEM", "Online payment expired");
			orderRepository.save(order);
			restTemplate.put("http://localhost:3334/Ekart/product-api/orders/" + order.getOrderId() + "/release", null);
		}
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
		orderDTO.setPaymentThrough(order.getPaymentThrough() == null ? "UNKNOWN" : order.getPaymentThrough().toString());
		orderDTO.setPaymentStatus(order.getPaymentStatus() == null ? PaymentStatus.UNKNOWN.name() : order.getPaymentStatus().name());
		orderDTO.setTotalPrice(order.getTotalPrice());
		orderDTO.setDeliveryFee(order.getDeliveryFee());
		orderDTO.setOrderStatus(order.getOrderStatus().toString());
		orderDTO.setDiscount(order.getDiscount());
		orderDTO.setDeliveryType(order.getDeliveryType() == null ? "UNKNOWN" : order.getDeliveryType().toString());
		orderDTO.setAddressId(order.getAddressId());
		orderDTO.setDeliveryAddressSnapshot(order.getDeliveryAddressSnapshot());
		orderDTO.setPickupStoreLocation(order.getPickupStoreLocation());

		List<OrderedProductDTO> orderedProductDTOs = new ArrayList<>();
		for (OrderedProduct orderedProduct : order.getOrderedProducts()) {
			OrderedProductDTO orderedProductDTO = new OrderedProductDTO();
			ProductDTO productDTO = new ProductDTO();
			productDTO.setProductId(orderedProduct.getProductId());
			productDTO.setName(orderedProduct.getProductNameSnapshot());
			productDTO.setDescription(orderedProduct.getDescriptionSnapshot());
			productDTO.setImageUrl(orderedProduct.getImageUrlSnapshot());
			productDTO.setCategory(orderedProduct.getCategorySnapshot());
			productDTO.setUnit(orderedProduct.getUnitSnapshot());
			productDTO.setUnitQuantity(orderedProduct.getUnitQuantitySnapshot());
			productDTO.setPrice(orderedProduct.getUnitPrice());
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
