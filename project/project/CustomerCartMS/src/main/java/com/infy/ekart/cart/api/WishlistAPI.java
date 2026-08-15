package com.infy.ekart.cart.api;

import java.util.Set;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.infy.ekart.cart.dto.ProductDTO;
import com.infy.ekart.cart.dto.WishlistItemDTO;
import com.infy.ekart.cart.exception.EKartCustomerCartException;
import com.infy.ekart.cart.service.WishlistService;

@CrossOrigin
@RestController
@Validated
@RequestMapping(value = "/wishlist-api")
public class WishlistAPI {

	@Autowired
	private WishlistService wishlistService;

	@Autowired
	private Environment environment;

	@Autowired
	private RestTemplate template;

	Log logger = LogFactory.getLog(WishlistAPI.class);

	@PostMapping(value = "/customer/{customerEmailId}/product/{productId}")
	public ResponseEntity<String> addProductToWishlist(
			@Pattern(regexp = "[a-zA-Z0-9._]+@[a-zA-Z]{2,}\\.[a-zA-Z][a-zA-Z.]+", message = "{invalid.customeremail.format}") @PathVariable String customerEmailId,
			@NotNull(message = "{cartproduct.productid.absent}") @PathVariable Integer productId)
			throws EKartCustomerCartException {
		logger.info("Received a request to add product " + productId + " to the wishlist of " + customerEmailId);
		wishlistService.addProductToWishlist(customerEmailId, productId);
		return new ResponseEntity<>(environment.getProperty("WishlistAPI.PRODUCT_ADDED_TO_WISHLIST"), HttpStatus.CREATED);
	}

	@GetMapping(value = "/customer/{customerEmailId}/products")
	public ResponseEntity<Set<WishlistItemDTO>> getWishlistItems(
			@Pattern(regexp = "[a-zA-Z0-9._]+@[a-zA-Z]{2,}\\.[a-zA-Z][a-zA-Z.]+", message = "{invalid.customeremail.format}") @PathVariable String customerEmailId)
			throws EKartCustomerCartException {
		Set<WishlistItemDTO> wishlistItemDTOs = wishlistService.getWishlistItems(customerEmailId);
		for (WishlistItemDTO wishlistItemDTO : wishlistItemDTOs) {
			ProductDTO productDTO = template.getForEntity(
					"http://localhost:3334/Ekart/product-api/product/" + wishlistItemDTO.getProduct().getProductId(),
					ProductDTO.class).getBody();
			wishlistItemDTO.setProduct(productDTO);
		}
		return new ResponseEntity<>(wishlistItemDTOs, HttpStatus.OK);
	}

	@DeleteMapping(value = "/customer/{customerEmailId}/product/{productId}")
	public ResponseEntity<String> removeProductFromWishlist(
			@Pattern(regexp = "[a-zA-Z0-9._]+@[a-zA-Z]{2,}\\.[a-zA-Z][a-zA-Z.]+", message = "{invalid.customeremail.format}") @PathVariable String customerEmailId,
			@NotNull(message = "{cartproduct.productid.absent}") @PathVariable Integer productId)
			throws EKartCustomerCartException {
		wishlistService.removeProductFromWishlist(customerEmailId, productId);
		return new ResponseEntity<>(environment.getProperty("WishlistAPI.PRODUCT_REMOVED_FROM_WISHLIST"), HttpStatus.OK);
	}

}
