package com.infy.ekart.payment.repository;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.infy.ekart.payment.entity.PaymentTransaction;

public interface PaymentTransactionRepository extends CrudRepository<PaymentTransaction, Integer> {

	Optional<PaymentTransaction> findByGatewayOrderId(String gatewayOrderId);

}
