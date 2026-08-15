package com.infy.ekart.product.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infy.ekart.product.entity.Offer;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Integer> {

	List<Offer> findByActiveTrue();
}
