package com.infy.ekart.customer.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.infy.ekart.customer.entity.Order;
import com.infy.ekart.customer.dto.OrderStatus;
import com.infy.ekart.customer.dto.PaymentStatus;
import com.infy.ekart.customer.dto.PaymentThrough;

public interface OrderRepository extends CrudRepository<Order, Integer> {

List<Order> findByCustomerEmailId(String customerEmailId);

List<Order> findAllByOrderByDateOfOrderDesc();

Optional<Order> findByOrderIdAndCustomerEmailId(Integer orderId, String customerEmailId);

List<Order> findByPaymentThroughAndPaymentStatusAndOrderStatusAndDateOfOrderBefore(
		PaymentThrough paymentThrough, PaymentStatus paymentStatus, OrderStatus orderStatus, java.time.LocalDateTime before);

}
