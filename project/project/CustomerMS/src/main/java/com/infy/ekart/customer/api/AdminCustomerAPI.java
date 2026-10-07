package com.infy.ekart.customer.api;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.ekart.customer.dto.AdminCustomerDTO;
import com.infy.ekart.customer.entity.Customer;
import com.infy.ekart.customer.entity.Role;
import com.infy.ekart.customer.repository.CustomerRepository;
import com.infy.ekart.customer.repository.OrderRepository;

@RestController
@RequestMapping("/admin-api/customers")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCustomerAPI {
	@Autowired private CustomerRepository customerRepository;
	@Autowired private OrderRepository orderRepository;

	@GetMapping
	public List<AdminCustomerDTO> getCustomers() {
		Map<String, Integer> orderCounts = new HashMap<>();
		orderRepository.findAll().forEach(order -> orderCounts.merge(order.getCustomerEmailId().toLowerCase(), 1, Integer::sum));
		List<AdminCustomerDTO> customers = new ArrayList<>();
		for (Customer customer : customerRepository.findAll()) {
			if (customer.getRole() != Role.CUSTOMER) continue;
			AdminCustomerDTO dto = new AdminCustomerDTO();
			dto.setEmailId(customer.getEmailId());
			dto.setName(customer.getName());
			dto.setPhoneNumber(customer.getPhoneNumber());
			dto.setOrderCount(orderCounts.getOrDefault(customer.getEmailId().toLowerCase(), 0));
			customers.add(dto);
		}
		return customers.stream().sorted(java.util.Comparator.comparing(AdminCustomerDTO::getName, String.CASE_INSENSITIVE_ORDER)).collect(Collectors.toList());
	}
}
