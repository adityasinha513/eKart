package com.infy.ekart.product.service;

import java.util.List;

import com.infy.ekart.product.dto.OfferDTO;
import com.infy.ekart.product.exception.EKartProductException;

public interface OfferService {

	List<OfferDTO> getActiveOffers();

	OfferDTO createOffer(OfferDTO offerDTO) throws EKartProductException;

	OfferDTO updateOffer(Integer offerId, OfferDTO offerDTO) throws EKartProductException;

	void deleteOffer(Integer offerId) throws EKartProductException;

}
