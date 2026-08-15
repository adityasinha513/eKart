package com.infy.ekart.product.api;

import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infy.ekart.product.dto.ProductDTO;
import com.infy.ekart.product.dto.RatingUpdateDTO;
import com.infy.ekart.product.exception.EKartProductException;
import com.infy.ekart.product.service.CustomerProductService;

@RestController
@RequestMapping(value = "/product-api")
public class CustomerProductAPI {

	@Autowired
	private CustomerProductService customerProductService;

	@Autowired
	private Environment environment;

	Log logger = LogFactory.getLog(CustomerProductAPI.class);

	@GetMapping(value = "/products")
	public ResponseEntity<List<ProductDTO>> getAllProducts(
			@RequestParam(required = false) Integer categoryId,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) Boolean vegOnly,
			@RequestParam(required = false) Boolean bestSellerOnly,
			@RequestParam(required = false) Boolean newArrivalsOnly,
			@RequestParam(required = false) Double minPrice,
			@RequestParam(required = false) Double maxPrice,
			@RequestParam(required = false) String sortBy) throws EKartProductException {
		logger.info("Retrieving product records from ProductMS with filters");
		List<ProductDTO> products = customerProductService.getAllProducts(categoryId, search, vegOnly,
				bestSellerOnly, newArrivalsOnly, minPrice, maxPrice, sortBy);
		return new ResponseEntity<>(products, HttpStatus.OK);
	}

	@GetMapping(value = "/product/{productId}")
	public ResponseEntity<ProductDTO> getProductById(@PathVariable Integer productId) throws EKartProductException {
		logger.info("Retrieving product with productId : " + productId);
		ProductDTO productDTO = customerProductService.getProductById(productId);
		return new ResponseEntity<>(productDTO, HttpStatus.OK);
	}

	@PutMapping(value = "/update/{productId}")
	public ResponseEntity<String> reduceAvailableQuantity(@PathVariable Integer productId,
			@RequestBody Integer quantity) throws EKartProductException {
		logger.info("Reducing quantity for productId : " + productId + " by requested quantity : " + quantity);
		if (quantity == null || quantity <= 0) {
			throw new EKartProductException("ProductService.INVALID_QUANTITY", HttpStatus.BAD_REQUEST);
		}
		customerProductService.reduceAvailableQuantity(productId, quantity);
		String successMessage = environment.getProperty("ProductAPI.REDUCE_QUANTITY_SUCCESSFULL");
		return new ResponseEntity<>(successMessage, HttpStatus.OK);
	}

	/**
	 * Called by CustomerMS whenever a review is submitted/moderated, to keep this denormalized
	 * rating summary in sync without every product-list request needing a cross-service call.
	 */
	@PutMapping(value = "/product/{productId}/rating")
	public ResponseEntity<String> updateProductRating(@PathVariable Integer productId,
			@RequestBody RatingUpdateDTO ratingUpdateDTO) throws EKartProductException {
		customerProductService.updateProductRating(productId, ratingUpdateDTO.getAvgRating(), ratingUpdateDTO.getRatingCount());
		return new ResponseEntity<>(environment.getProperty("ProductAPI.RATING_UPDATED"), HttpStatus.OK);
	}
}
