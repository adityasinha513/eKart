package com.infy.ekart.customer.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import com.infy.ekart.customer.entity.OrderStatusHistory;

public interface OrderStatusHistoryRepository extends CrudRepository<OrderStatusHistory, Integer> {

	List<OrderStatusHistory> findByOrderIdOrderByChangedAtAsc(Integer orderId);

}
