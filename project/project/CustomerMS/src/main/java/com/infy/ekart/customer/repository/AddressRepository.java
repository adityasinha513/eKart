package com.infy.ekart.customer.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import com.infy.ekart.customer.entity.Address;

public interface AddressRepository extends CrudRepository<Address, Integer> {

	List<Address> findByCustomerEmailId(String customerEmailId);

}
