package com.infy.ekart.customer.service;

import java.util.List;

import com.infy.ekart.customer.dto.AddressDTO;
import com.infy.ekart.customer.exception.EKartCustomerException;

public interface AddressService {

	List<AddressDTO> getAddressesForCustomer(String customerEmailId);

	AddressDTO addAddress(String customerEmailId, AddressDTO addressDTO);

	AddressDTO updateAddress(String customerEmailId, Integer addressId, AddressDTO addressDTO)
			throws EKartCustomerException;

	void deleteAddress(String customerEmailId, Integer addressId) throws EKartCustomerException;

	AddressDTO setDefaultAddress(String customerEmailId, Integer addressId) throws EKartCustomerException;

}
