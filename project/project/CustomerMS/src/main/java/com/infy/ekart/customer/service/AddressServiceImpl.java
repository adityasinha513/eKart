package com.infy.ekart.customer.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infy.ekart.customer.dto.AddressDTO;
import com.infy.ekart.customer.entity.Address;
import com.infy.ekart.customer.exception.EKartCustomerException;
import com.infy.ekart.customer.repository.AddressRepository;

@Service(value = "addressService")
@Transactional
public class AddressServiceImpl implements AddressService {

	@Autowired
	private AddressRepository addressRepository;

	@Override
	public List<AddressDTO> getAddressesForCustomer(String customerEmailId) {
		return addressRepository.findByCustomerEmailId(customerEmailId.toLowerCase()).stream()
				.map(this::mapToDTO)
				.collect(Collectors.toList());
	}

	@Override
	public AddressDTO addAddress(String customerEmailId, AddressDTO addressDTO) {
		String email = customerEmailId.toLowerCase();
		List<Address> existing = addressRepository.findByCustomerEmailId(email);

		Address address = new Address();
		address.setCustomerEmailId(email);
		applyDtoToEntity(addressDTO, address);

		// The very first address a customer adds is always their default, regardless of
		// what the client sent.
		boolean makeDefault = existing.isEmpty() || addressDTO.isDefault();
		if (makeDefault) {
			existing.forEach(a -> a.setDefault(false));
			address.setDefault(true);
		}

		addressRepository.save(address);
		return mapToDTO(address);
	}

	@Override
	public AddressDTO updateAddress(String customerEmailId, Integer addressId, AddressDTO addressDTO)
			throws EKartCustomerException {
		Address address = findOwnedAddressOrThrow(customerEmailId, addressId);
		applyDtoToEntity(addressDTO, address);

		if (addressDTO.isDefault() && !address.isDefault()) {
			addressRepository.findByCustomerEmailId(address.getCustomerEmailId()).forEach(a -> a.setDefault(false));
			address.setDefault(true);
		}

		addressRepository.save(address);
		return mapToDTO(address);
	}

	@Override
	public void deleteAddress(String customerEmailId, Integer addressId) throws EKartCustomerException {
		Address address = findOwnedAddressOrThrow(customerEmailId, addressId);
		boolean wasDefault = address.isDefault();
		addressRepository.delete(address);

		if (wasDefault) {
			addressRepository.findByCustomerEmailId(address.getCustomerEmailId()).stream()
					.findFirst()
					.ifPresent(next -> next.setDefault(true));
		}
	}

	@Override
	public AddressDTO setDefaultAddress(String customerEmailId, Integer addressId) throws EKartCustomerException {
		Address address = findOwnedAddressOrThrow(customerEmailId, addressId);
		addressRepository.findByCustomerEmailId(address.getCustomerEmailId()).forEach(a -> a.setDefault(false));
		address.setDefault(true);
		addressRepository.save(address);
		return mapToDTO(address);
	}

	private Address findOwnedAddressOrThrow(String customerEmailId, Integer addressId) throws EKartCustomerException {
		Address address = addressRepository.findById(addressId)
				.orElseThrow(() -> new EKartCustomerException("AddressService.ADDRESS_NOT_FOUND"));
		if (!address.getCustomerEmailId().equalsIgnoreCase(customerEmailId)) {
			throw new EKartCustomerException("AddressService.ADDRESS_NOT_FOUND");
		}
		return address;
	}

	private void applyDtoToEntity(AddressDTO addressDTO, Address address) {
		address.setLabel(addressDTO.getLabel());
		address.setLine1(addressDTO.getLine1());
		address.setLine2(addressDTO.getLine2());
		address.setCity(addressDTO.getCity());
		address.setState(addressDTO.getState());
		address.setPincode(addressDTO.getPincode());
		address.setLandmark(addressDTO.getLandmark());
		address.setLatitude(addressDTO.getLatitude());
		address.setLongitude(addressDTO.getLongitude());
	}

	private AddressDTO mapToDTO(Address address) {
		AddressDTO addressDTO = new AddressDTO();
		addressDTO.setAddressId(address.getAddressId());
		addressDTO.setLabel(address.getLabel());
		addressDTO.setLine1(address.getLine1());
		addressDTO.setLine2(address.getLine2());
		addressDTO.setCity(address.getCity());
		addressDTO.setState(address.getState());
		addressDTO.setPincode(address.getPincode());
		addressDTO.setLandmark(address.getLandmark());
		addressDTO.setDefault(address.isDefault());
		addressDTO.setLatitude(address.getLatitude());
		addressDTO.setLongitude(address.getLongitude());
		return addressDTO;
	}

}
