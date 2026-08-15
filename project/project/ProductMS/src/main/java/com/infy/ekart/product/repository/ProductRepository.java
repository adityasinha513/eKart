package com.infy.ekart.product.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infy.ekart.product.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

	@Override
	List<Product> findAll();

	List<Product> findByCategory_CategoryId(Integer categoryId);
}
