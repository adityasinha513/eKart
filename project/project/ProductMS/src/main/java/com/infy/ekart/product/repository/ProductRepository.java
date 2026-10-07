package com.infy.ekart.product.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import javax.persistence.LockModeType;

import com.infy.ekart.product.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

	@Override
	List<Product> findAll();

	List<Product> findByCategory_CategoryId(Integer categoryId);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select p from Product p where p.productId = :productId")
	java.util.Optional<Product> findByIdForUpdate(@Param("productId") Integer productId);
}
