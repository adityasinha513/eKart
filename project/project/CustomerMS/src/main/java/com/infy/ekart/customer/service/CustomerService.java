package com.infy.ekart.customer.service;

import com.infy.ekart.customer.dto.CustomerDTO;
import com.infy.ekart.customer.exception.EKartCustomerException;

public interface CustomerService {

	CustomerDTO authenticateCustomer(String emailId, String password) throws EKartCustomerException;

	String registerNewCustomer(CustomerDTO customerDTO) throws EKartCustomerException;

	 CustomerDTO getCustomerByEmailId(String emailId) throws EKartCustomerException;
	 
	 

	
}
