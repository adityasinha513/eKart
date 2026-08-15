package com.infy.ekart.product.api;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.ekart.product.dto.ProductDTO;
import com.infy.ekart.product.exception.EKartProductException;
import com.infy.ekart.product.service.CustomerProductService;

/**
 * Admin-only catalog management. Reachable externally only via
 * /api/admin/products/** through EkartGateway, which requires an ADMIN-role JWT before
 * the request even reaches this service; SecurityConfig also enforces ADMIN role here as
 * defense in depth.
 */
@RestController
@RequestMapping(value = "/admin-api/products")
public class AdminProductAPI {

	@Autowired
	private CustomerProductService customerProductService;

	@Autowired
	private Environment environment;

	@PostMapping
	public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductDTO productDTO)
			throws EKartProductException {
		return new ResponseEntity<>(customerProductService.createProduct(productDTO), HttpStatus.CREATED);
	}

	@PutMapping(value = "/{productId}")
	public ResponseEntity<ProductDTO> updateProduct(@PathVariable Integer productId,
			@Valid @RequestBody ProductDTO productDTO) throws EKartProductException {
		return new ResponseEntity<>(customerProductService.updateProduct(productId, productDTO), HttpStatus.OK);
	}

	@DeleteMapping(value = "/{productId}")
	public ResponseEntity<String> deleteProduct(@PathVariable Integer productId) throws EKartProductException {
		customerProductService.deleteProduct(productId);
		return new ResponseEntity<>(environment.getProperty("AdminProductAPI.PRODUCT_DELETED"), HttpStatus.OK);
	}

	@PatchMapping(value = "/{productId}/availability")
	public ResponseEntity<ProductDTO> setAvailability(@PathVariable Integer productId, @RequestBody boolean available)
			throws EKartProductException {
		return new ResponseEntity<>(customerProductService.setAvailability(productId, available), HttpStatus.OK);
	}

}
