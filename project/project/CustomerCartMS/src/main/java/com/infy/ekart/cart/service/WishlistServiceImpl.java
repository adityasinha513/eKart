package com.infy.ekart.cart.service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infy.ekart.cart.dto.ProductDTO;
import com.infy.ekart.cart.dto.WishlistItemDTO;
import com.infy.ekart.cart.entity.Wishlist;
import com.infy.ekart.cart.entity.WishlistItem;
import com.infy.ekart.cart.exception.EKartCustomerCartException;
import com.infy.ekart.cart.repository.WishlistItemRepository;
import com.infy.ekart.cart.repository.WishlistRepository;

@Service(value = "wishlistService")
@Transactional
public class WishlistServiceImpl implements WishlistService {

	@Autowired
	private WishlistRepository wishlistRepository;

	@Autowired
	private WishlistItemRepository wishlistItemRepository;

	@Override
	public void addProductToWishlist(String customerEmailId, Integer productId) throws EKartCustomerCartException {
		WishlistItem newItem = new WishlistItem();
		newItem.setProductId(productId);

		Optional<Wishlist> wishlistOptional = wishlistRepository.findByCustomerEmailId(customerEmailId);
		if (wishlistOptional.isEmpty()) {
			Wishlist wishlist = new Wishlist();
			wishlist.setCustomerEmailId(customerEmailId);
			Set<WishlistItem> items = new HashSet<>();
			items.add(newItem);
			wishlist.setWishlistItems(items);
			wishlistRepository.save(wishlist);
		} else {
			Wishlist wishlist = wishlistOptional.get();
			// Set semantics (equals/hashCode on productId) make this a no-op if already present
			wishlist.getWishlistItems().add(newItem);
		}
	}

	@Override
	public Set<WishlistItemDTO> getWishlistItems(String customerEmailId) throws EKartCustomerCartException {
		Wishlist wishlist = wishlistRepository.findByCustomerEmailId(customerEmailId)
				.orElseThrow(() -> new EKartCustomerCartException("WishlistService.NO_WISHLIST_FOUND"));

		return wishlist.getWishlistItems().stream().map(item -> {
			WishlistItemDTO dto = new WishlistItemDTO();
			dto.setWishlistItemId(item.getWishlistItemId());
			dto.setAddedAt(item.getAddedAt());
			ProductDTO productDTO = new ProductDTO();
			productDTO.setProductId(item.getProductId());
			dto.setProduct(productDTO);
			return dto;
		}).collect(Collectors.toSet());
	}

	@Override
	public void removeProductFromWishlist(String customerEmailId, Integer productId) throws EKartCustomerCartException {
		Wishlist wishlist = wishlistRepository.findByCustomerEmailId(customerEmailId)
				.orElseThrow(() -> new EKartCustomerCartException("WishlistService.NO_WISHLIST_FOUND"));

		WishlistItem selected = wishlist.getWishlistItems().stream()
				.filter(item -> item.getProductId().equals(productId))
				.findFirst()
				.orElseThrow(() -> new EKartCustomerCartException("WishlistService.PRODUCT_NOT_IN_WISHLIST"));

		wishlist.getWishlistItems().remove(selected);
		wishlistItemRepository.delete(selected);
	}

}
