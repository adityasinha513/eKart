package com.infy.ekart.customer.api;

import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.ekart.customer.dto.AddressDTO;
import com.infy.ekart.customer.exception.EKartCustomerException;
import com.infy.ekart.customer.service.AddressService;

@CrossOrigin
@RestController
@Validated
@RequestMapping(value = "/customer-api/customer/{customerEmailId:.+}/addresses")
public class AddressAPI {

	@Autowired
	private AddressService addressService;

	@GetMapping
	public ResponseEntity<List<AddressDTO>> getAddresses(
			@Pattern(regexp = "[a-zA-Z0-9._]+@[a-zA-Z]{2,}\\.[a-zA-Z][a-zA-Z.]+", message = "{invalid.email.format}") @PathVariable String customerEmailId) {
		return new ResponseEntity<>(addressService.getAddressesForCustomer(customerEmailId), HttpStatus.OK);
	}

	@PostMapping
	public ResponseEntity<AddressDTO> addAddress(
			@Pattern(regexp = "[a-zA-Z0-9._]+@[a-zA-Z]{2,}\\.[a-zA-Z][a-zA-Z.]+", message = "{invalid.email.format}") @PathVariable String customerEmailId,
			@Valid @RequestBody AddressDTO addressDTO) {
		return new ResponseEntity<>(addressService.addAddress(customerEmailId, addressDTO), HttpStatus.CREATED);
	}

	@PutMapping(value = "/{addressId}")
	public ResponseEntity<AddressDTO> updateAddress(
			@Pattern(regexp = "[a-zA-Z0-9._]+@[a-zA-Z]{2,}\\.[a-zA-Z][a-zA-Z.]+", message = "{invalid.email.format}") @PathVariable String customerEmailId,
			@PathVariable Integer addressId, @Valid @RequestBody AddressDTO addressDTO) throws EKartCustomerException {
		return new ResponseEntity<>(addressService.updateAddress(customerEmailId, addressId, addressDTO), HttpStatus.OK);
	}

	@DeleteMapping(value = "/{addressId}")
	public ResponseEntity<Void> deleteAddress(
			@Pattern(regexp = "[a-zA-Z0-9._]+@[a-zA-Z]{2,}\\.[a-zA-Z][a-zA-Z.]+", message = "{invalid.email.format}") @PathVariable String customerEmailId,
			@PathVariable Integer addressId) throws EKartCustomerException {
		addressService.deleteAddress(customerEmailId, addressId);
		return new ResponseEntity<>(HttpStatus.NO_CONTENT);
	}

	@PatchMapping(value = "/{addressId}/default")
	public ResponseEntity<AddressDTO> setDefaultAddress(
			@Pattern(regexp = "[a-zA-Z0-9._]+@[a-zA-Z]{2,}\\.[a-zA-Z][a-zA-Z.]+", message = "{invalid.email.format}") @PathVariable String customerEmailId,
			@PathVariable Integer addressId) throws EKartCustomerException {
		return new ResponseEntity<>(addressService.setDefaultAddress(customerEmailId, addressId), HttpStatus.OK);
	}

}
