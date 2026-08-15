package com.infy.ekart.product.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infy.ekart.product.dto.OfferDTO;
import com.infy.ekart.product.entity.DiscountType;
import com.infy.ekart.product.entity.Offer;
import com.infy.ekart.product.exception.EKartProductException;
import com.infy.ekart.product.repository.OfferRepository;

@Service(value = "offerService")
@Transactional
public class OfferServiceImpl implements OfferService {

	@Autowired
	private OfferRepository offerRepository;

	@Override
	public List<OfferDTO> getActiveOffers() {
		return offerRepository.findByActiveTrue().stream()
				.filter(Offer::isCurrentlyRunning)
				.map(this::mapToDTO)
				.collect(Collectors.toList());
	}

	@Override
	public OfferDTO createOffer(OfferDTO offerDTO) throws EKartProductException {
		Offer offer = new Offer();
		applyDtoToEntity(offerDTO, offer);
		offerRepository.save(offer);
		return mapToDTO(offer);
	}

	@Override
	public OfferDTO updateOffer(Integer offerId, OfferDTO offerDTO) throws EKartProductException {
		Offer offer = offerRepository.findById(offerId)
				.orElseThrow(() -> new EKartProductException("OfferService.OFFER_NOT_FOUND", HttpStatus.NOT_FOUND));
		applyDtoToEntity(offerDTO, offer);
		offerRepository.save(offer);
		return mapToDTO(offer);
	}

	@Override
	public void deleteOffer(Integer offerId) throws EKartProductException {
		Offer offer = offerRepository.findById(offerId)
				.orElseThrow(() -> new EKartProductException("OfferService.OFFER_NOT_FOUND", HttpStatus.NOT_FOUND));
		offerRepository.delete(offer);
	}

	private void applyDtoToEntity(OfferDTO offerDTO, Offer offer) throws EKartProductException {
		if (offerDTO.getProductId() != null && offerDTO.getCategoryId() != null) {
			throw new EKartProductException("OfferService.OFFER_SCOPE_AMBIGUOUS", HttpStatus.BAD_REQUEST);
		}
		offer.setName(offerDTO.getName());
		try {
			offer.setDiscountType(DiscountType.valueOf(offerDTO.getDiscountType()));
		} catch (IllegalArgumentException e) {
			throw new EKartProductException("OfferService.INVALID_DISCOUNT_TYPE", HttpStatus.BAD_REQUEST);
		}
		offer.setDiscountValue(offerDTO.getDiscountValue());
		offer.setProductId(offerDTO.getProductId());
		offer.setCategoryId(offerDTO.getCategoryId());
		offer.setStartDate(offerDTO.getStartDate());
		offer.setEndDate(offerDTO.getEndDate());
		offer.setActive(offerDTO.isActive());
	}

	private OfferDTO mapToDTO(Offer offer) {
		OfferDTO offerDTO = new OfferDTO();
		offerDTO.setOfferId(offer.getOfferId());
		offerDTO.setName(offer.getName());
		offerDTO.setDiscountType(offer.getDiscountType().name());
		offerDTO.setDiscountValue(offer.getDiscountValue());
		offerDTO.setProductId(offer.getProductId());
		offerDTO.setCategoryId(offer.getCategoryId());
		offerDTO.setStartDate(offer.getStartDate());
		offerDTO.setEndDate(offer.getEndDate());
		offerDTO.setActive(offer.isActive());
		return offerDTO;
	}

}
