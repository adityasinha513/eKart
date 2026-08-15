package com.infy.ekart.cart.api;

import java.util.Set;


import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.infy.ekart.cart.dto.CartProductDTO;
import com.infy.ekart.cart.dto.CustomerCartDTO;
import com.infy.ekart.cart.dto.ProductDTO;
import com.infy.ekart.cart.exception.EKartCustomerCartException;
import com.infy.ekart.cart.service.CustomerCartService;



@CrossOrigin
@RestController
@Validated
@RequestMapping(value = "/customercart-api")
public class CustomerCartAPI {

	@Autowired
	private CustomerCartService customerCartService;

	@Autowired
	private Environment environment;

	@Autowired
	private RestTemplate template;
     
	
	Log logger = LogFactory.getLog(CustomerCartAPI.class);

	@PostMapping(value = "/products")
	public ResponseEntity<String> addProductToCart(@Valid @RequestBody CustomerCartDTO customerCartDTO)
			throws EKartCustomerCartException {
		logger.info("Received a request to add products for " + customerCartDTO.getCustomerEmailId());
		Integer cartId = customerCartService.addProductToCart(customerCartDTO);
		String message = environment.getProperty("CustomerCartAPI.PRODUCT_ADDED_TO_CART");
		return new ResponseEntity<>(message + "  " + cartId, HttpStatus.CREATED);
	}

	@GetMapping(value = "/customer/{customerEmailId}/products")
	public ResponseEntity<Set<CartProductDTO>> getProductsFromCart(
			@Pattern(regexp = "[a-zA-Z0-9._]+@[a-zA-Z]{2,}\\.[a-zA-Z][a-zA-Z.]+", message = "{invalid.customeremail.format}") @PathVariable("customerEmailId") String customerEmailId)
			throws EKartCustomerCartException {
		logger.info("Received a request to get products details from the cart of "+customerEmailId);

		Set<CartProductDTO> cartProductDTOs = customerCartService.getProductsFromCart(customerEmailId);
		for (CartProductDTO cartProductDTO : cartProductDTOs) {
			ProductDTO productDTO = template.getForEntity("http://localhost:3334/Ekart/product-api/product/" + cartProductDTO.getProduct().getProductId(),
					ProductDTO.class).getBody();
			
			// We are calling the ProductMS using hard-coded URI
		    // Replace this call with the appropriate MS name
		    // Product API is upscaled (available in 2 numbers). Hence, use load balanced
			// template to make call to the Product API
			
			cartProductDTO.setProduct(productDTO);

		}
		return new ResponseEntity<>(cartProductDTOs, HttpStatus.OK);

	}
	
	@DeleteMapping(value = "/customer/{customerEmailId}/product/{productId}")
	public ResponseEntity<String> deleteProductFromCart(
			@Pattern(regexp = "[a-zA-Z0-9._]+@[a-zA-Z]{2,}\\.[a-zA-Z][a-zA-Z.]+", message = "{invalid.customeremail.format}") @PathVariable("customerEmailId") String customerEmailId,
			@NotNull(message = "{cartproduct.productid.absent}") @PathVariable("productId") Integer productId)
			throws EKartCustomerCartException {

		logger.info("Received a request to delete product " + productId + " from the cart of " + customerEmailId);
		customerCartService.deleteProductFromCart(customerEmailId, productId);
		String message = environment.getProperty("CustomerCartAPI.PRODUCT_DELETED_FROM_CART_SUCCESS");
		return new ResponseEntity<>(message, HttpStatus.OK);

	}

	@PutMapping(value = "/customer/{customerEmailId}/product/{productId}")
	public ResponseEntity<String> modifyQuantityOfProductInCart(
			@Pattern(regexp = "[a-zA-Z0-9._]+@[a-zA-Z]{2,}\\.[a-zA-Z][a-zA-Z.]+", message = "{invalid.customeremail.format}") @PathVariable("customerEmailId") String customerEmailId,
			@NotNull(message = "{cartproduct.productid.absent}") @PathVariable("productId") Integer productId,
			@RequestBody Integer quantity) throws EKartCustomerCartException {

		logger.info("Received a request to update quantity of product " + productId + " in the cart of " + customerEmailId);
		customerCartService.modifyQuantityOfProductInCart(customerEmailId, productId, quantity);
		String message = environment.getProperty("CustomerCartAPI.PRODUCT_QUANTITY_UPDATE_FROM_CART_SUCCESS");
		return new ResponseEntity<>(message, HttpStatus.OK);

	}

	@DeleteMapping(value = "/customer/{customerEmailId}/products")
	public ResponseEntity<String> deleteAllProductsFromCart(
			@Pattern(regexp = "[a-zA-Z0-9._]+@[a-zA-Z]{2,}\\.[a-zA-Z][a-zA-Z.]+", message = "{invalid.customeremail.format}") @PathVariable("customerEmailId") String customerEmailId)
			throws EKartCustomerCartException {
		logger.info("Received a request to clear the cart of "+customerEmailId );

		customerCartService.deleteAllProductsFromCart(customerEmailId);
		String message = environment.getProperty("CustomerCartAPI.ALL_PRODUCTS_DELETED");
		return new ResponseEntity<>(message, HttpStatus.OK);

	}

}
