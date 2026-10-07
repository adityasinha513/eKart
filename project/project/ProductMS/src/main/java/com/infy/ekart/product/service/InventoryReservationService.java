package com.infy.ekart.product.service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infy.ekart.product.dto.InventoryReservationRequest;
import com.infy.ekart.product.entity.InventoryReservation;
import com.infy.ekart.product.entity.Product;
import com.infy.ekart.product.exception.EKartProductException;
import com.infy.ekart.product.repository.InventoryReservationRepository;
import com.infy.ekart.product.repository.ProductRepository;

@Service
public class InventoryReservationService {
	@Autowired private ProductRepository products;
	@Autowired private InventoryReservationRepository reservations;

	@Transactional(rollbackFor = Exception.class)
	public void reserve(InventoryReservationRequest request) throws EKartProductException {
		Map<Integer, Integer> requested = new LinkedHashMap<>();
		for (InventoryReservationRequest.Item item : request.getItems()) {
			requested.merge(item.getProductId(), item.getQuantity(), Integer::sum);
		}
		List<InventoryReservation> existing = reservations.findByOrderId(request.getOrderId());
		if (!existing.isEmpty()) {
			Map<Integer, Integer> prior = existing.stream().collect(Collectors.toMap(
					InventoryReservation::getProductId, InventoryReservation::getQuantity));
			if (existing.stream().allMatch(r -> "RESERVED".equals(r.getState())) && prior.equals(requested)) return;
			throw new EKartProductException("ProductService.RESERVATION_CONFLICT", HttpStatus.CONFLICT);
		}

		Map<Integer, Product> locked = new LinkedHashMap<>();
		for (Integer productId : requested.keySet().stream().sorted(Comparator.naturalOrder()).collect(Collectors.toList())) {
			Product product = products.findByIdForUpdate(productId)
					.orElseThrow(() -> new EKartProductException("ProductService.PRODUCT_NOT_AVAILABLE", HttpStatus.NOT_FOUND));
			if (!product.isAvailable() || product.getAvailableQuantity() == null
					|| product.getAvailableQuantity() < requested.get(productId)) {
				throw new EKartProductException("ProductService.INSUFFICIENT_STOCK", HttpStatus.CONFLICT);
			}
			locked.put(productId, product);
		}
		requested.forEach((productId, quantity) -> {
			Product product = locked.get(productId);
			product.setAvailableQuantity(product.getAvailableQuantity() - quantity);
			products.save(product);
			InventoryReservation reservation = new InventoryReservation();
			reservation.setOrderId(request.getOrderId());
			reservation.setProductId(productId);
			reservation.setQuantity(quantity);
			reservation.setState("RESERVED");
			reservations.save(reservation);
		});
	}

	@Transactional(rollbackFor = Exception.class)
	public void release(Integer orderId) throws EKartProductException {
		List<InventoryReservation> orderReservations = reservations.findByOrderIdForUpdate(orderId);
		for (InventoryReservation reservation : orderReservations.stream()
				.sorted(Comparator.comparing(InventoryReservation::getProductId)).collect(Collectors.toList())) {
			if (!"RESERVED".equals(reservation.getState())) continue;
			Product product = products.findByIdForUpdate(reservation.getProductId())
					.orElseThrow(() -> new EKartProductException("ProductService.PRODUCT_NOT_AVAILABLE", HttpStatus.NOT_FOUND));
			product.setAvailableQuantity(product.getAvailableQuantity() + reservation.getQuantity());
			products.save(product);
			reservation.setState("RELEASED");
			reservations.save(reservation);
		}
	}
}
