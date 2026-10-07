package com.infy.ekart.product.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import javax.persistence.LockModeType;

import com.infy.ekart.product.entity.InventoryReservation;

@Repository
public interface InventoryReservationRepository extends JpaRepository<InventoryReservation, Integer> {
	List<InventoryReservation> findByOrderId(Integer orderId);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select r from InventoryReservation r where r.orderId = :orderId order by r.productId")
	List<InventoryReservation> findByOrderIdForUpdate(@Param("orderId") Integer orderId);
}
