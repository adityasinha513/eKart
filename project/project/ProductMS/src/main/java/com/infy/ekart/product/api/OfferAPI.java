package com.infy.ekart.product.api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.ekart.product.dto.OfferDTO;
import com.infy.ekart.product.service.OfferService;

@RestController
@RequestMapping(value = "/offer-api")
public class OfferAPI {

	@Autowired
	private OfferService offerService;

	@GetMapping(value = "/offers")
	public ResponseEntity<List<OfferDTO>> getActiveOffers() {
		return new ResponseEntity<>(offerService.getActiveOffers(), HttpStatus.OK);
	}

}
