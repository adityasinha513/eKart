package com.infy.ekart.product.api;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.ekart.product.dto.OfferDTO;
import com.infy.ekart.product.exception.EKartProductException;
import com.infy.ekart.product.service.OfferService;

@RestController
@RequestMapping(value = "/admin-api/offers")
public class AdminOfferAPI {

	@Autowired
	private OfferService offerService;

	@Autowired
	private Environment environment;

	@PostMapping
	public ResponseEntity<OfferDTO> createOffer(@Valid @RequestBody OfferDTO offerDTO) throws EKartProductException {
		return new ResponseEntity<>(offerService.createOffer(offerDTO), HttpStatus.CREATED);
	}

	@PutMapping(value = "/{offerId}")
	public ResponseEntity<OfferDTO> updateOffer(@PathVariable Integer offerId, @Valid @RequestBody OfferDTO offerDTO)
			throws EKartProductException {
		return new ResponseEntity<>(offerService.updateOffer(offerId, offerDTO), HttpStatus.OK);
	}

	@DeleteMapping(value = "/{offerId}")
	public ResponseEntity<String> deleteOffer(@PathVariable Integer offerId) throws EKartProductException {
		offerService.deleteOffer(offerId);
		return new ResponseEntity<>(environment.getProperty("AdminOfferAPI.OFFER_DELETED"), HttpStatus.OK);
	}

}
