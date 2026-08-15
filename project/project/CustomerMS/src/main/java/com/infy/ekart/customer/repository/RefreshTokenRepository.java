package com.infy.ekart.customer.repository;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.infy.ekart.customer.entity.RefreshToken;

public interface RefreshTokenRepository extends CrudRepository<RefreshToken, Integer> {

	Optional<RefreshToken> findByTokenHash(String tokenHash);

}
