package com.infy.ekart.customer.api;

import java.time.LocalDateTime;

import javax.validation.Valid;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.infy.ekart.customer.dto.AuthResponseDTO;
import com.infy.ekart.customer.dto.CartProductDTO;
import com.infy.ekart.customer.dto.CustomerCartDTO;
import com.infy.ekart.customer.dto.CustomerDTO;
import com.infy.ekart.customer.dto.LoginRequestDTO;
import com.infy.ekart.customer.dto.ProductDTO;
import com.infy.ekart.customer.dto.RefreshTokenRequestDTO;
import com.infy.ekart.customer.entity.RefreshToken;
import com.infy.ekart.customer.exception.EKartCustomerException;
import com.infy.ekart.customer.repository.RefreshTokenRepository;
import com.infy.ekart.customer.security.JwtUtil;
import com.infy.ekart.customer.security.RefreshTokenUtil;
import com.infy.ekart.customer.service.CustomerService;


@CrossOrigin
@RequestMapping(value = "/customer-api")
@RestController
@Validated
public class CustomerAPI {

    @Autowired
	private CustomerService customerService;


    @Autowired
	private RestTemplate template;


    @Autowired
	private Environment environment;

	@Autowired
	private JwtUtil jwtUtil;

	@Autowired
	private RefreshTokenUtil refreshTokenUtil;

	@Autowired
	private RefreshTokenRepository refreshTokenRepository;

	@org.springframework.beans.factory.annotation.Value("${jwt.refresh-token-expiry-days}")
	private long refreshTokenExpiryDays;

	static Log logger = LogFactory.getLog(CustomerAPI.class);



	@PostMapping(value = "/login")
	public ResponseEntity<AuthResponseDTO> authenticateCustomer(@Valid @RequestBody LoginRequestDTO loginRequestDTO)
			throws EKartCustomerException {

		logger.info("CUSTOMER TRYING TO LOGIN, VALIDATING CREDENTIALS. CUSTOMER EMAIL ID: " + loginRequestDTO.getEmailId());
		CustomerDTO customerDTOFromDB = customerService.authenticateCustomer(loginRequestDTO.getEmailId(),
				loginRequestDTO.getPassword());
		logger.info("CUSTOMER LOGIN SUCCESS, CUSTOMER EMAIL : " + customerDTOFromDB.getEmailId());
		return new ResponseEntity<>(issueTokens(customerDTOFromDB), HttpStatus.OK);
	}

	@PostMapping(value = "/refresh-token")
	public ResponseEntity<AuthResponseDTO> refreshToken(@Valid @RequestBody RefreshTokenRequestDTO refreshTokenRequestDTO)
			throws EKartCustomerException {

		String hashedToken = refreshTokenUtil.hash(refreshTokenRequestDTO.getRefreshToken());
		RefreshToken storedToken = refreshTokenRepository.findByTokenHash(hashedToken)
				.orElseThrow(() -> new EKartCustomerException("CustomerService.INVALID_REFRESH_TOKEN"));

		if (storedToken.isRevoked() || storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
			throw new EKartCustomerException("CustomerService.INVALID_REFRESH_TOKEN");
		}

		// Rotate: revoke the used refresh token and issue a brand new pair
		storedToken.setRevoked(true);

		CustomerDTO customerDTO = customerService.getCustomerByEmailId(storedToken.getCustomerEmailId());
		return new ResponseEntity<>(issueTokens(customerDTO), HttpStatus.OK);
	}

	@PostMapping(value = "/logout")
	public ResponseEntity<String> logout(@Valid @RequestBody RefreshTokenRequestDTO refreshTokenRequestDTO) {
		String hashedToken = refreshTokenUtil.hash(refreshTokenRequestDTO.getRefreshToken());
		refreshTokenRepository.findByTokenHash(hashedToken).ifPresent(token -> token.setRevoked(true));
		return new ResponseEntity<>(environment.getProperty("CustomerAPI.LOGOUT_SUCCESS"), HttpStatus.OK);
	}

	private AuthResponseDTO issueTokens(CustomerDTO customerDTO) {
		String accessToken = jwtUtil.generateAccessToken(customerDTO.getEmailId(),
				com.infy.ekart.customer.entity.Role.valueOf(customerDTO.getRole()));

		String rawRefreshToken = refreshTokenUtil.generateRawToken();
		RefreshToken refreshToken = new RefreshToken();
		refreshToken.setCustomerEmailId(customerDTO.getEmailId());
		refreshToken.setTokenHash(refreshTokenUtil.hash(rawRefreshToken));
		refreshToken.setExpiresAt(LocalDateTime.now().plusDays(refreshTokenExpiryDays));
		refreshTokenRepository.save(refreshToken);

		AuthResponseDTO authResponseDTO = new AuthResponseDTO();
		authResponseDTO.setAccessToken(accessToken);
		authResponseDTO.setRefreshToken(rawRefreshToken);
		authResponseDTO.setEmailId(customerDTO.getEmailId());
		authResponseDTO.setName(customerDTO.getName());
		authResponseDTO.setPhoneNumber(customerDTO.getPhoneNumber());
		authResponseDTO.setRole(customerDTO.getRole());
		return authResponseDTO;
	}

	@PostMapping(value = "/register")
	public ResponseEntity<String> registerCustomer(@Valid @RequestBody CustomerDTO customerDTO)
			throws EKartCustomerException {

		logger.info("CUSTOMER TRYING TO REGISTER. CUSTOMER EMAIL ID: " + customerDTO.getEmailId());
		String registeredWithEmailID = customerService.registerNewCustomer(customerDTO);
		registeredWithEmailID = environment.getProperty("CustomerAPI.CUSTOMER_REGISTRATION_SUCCESS")
				+ registeredWithEmailID;
		return new ResponseEntity<>(registeredWithEmailID, HttpStatus.OK);
	}

	@PostMapping(value = "/customercarts/add-product")
	public ResponseEntity<String> addProductToCart(@Valid @RequestBody CustomerCartDTO customerCartDTO)
			throws EKartCustomerException {

		customerService.getCustomerByEmailId(customerCartDTO.getCustomerEmailId());

		for (CartProductDTO cartProductDTO : customerCartDTO.getCartProducts()) {
			
		template.getForEntity("http://localhost:3334/Ekart/product-api/product/"+cartProductDTO.getProduct().getProductId(), ProductDTO.class);
		
		// We are calling the product API using hard-coded URI
		// Replace this call with the appropriate MS name
		// Product API is upscaled (available in 2 numbers). Hence, use load balanced
		// template to make call to the Product API

			

		}
			ResponseEntity<String> productAddedToCartMessage = template.postForEntity("http://localhost:3335/Ekart/customercart-api/products",
			  customerCartDTO, String.class);
			
			// We are calling the Cart API using hard-coded URI
			// Replace this call with the appropriate MS name
			// CartMS is not an upscaled one (available in 1 number) , still load-balanced
			// rest template should be used here to make the call
			// Don't create and autowire a normal rest template because load balanced
			// template is already in config file
		
		return productAddedToCartMessage;
	}

}
