package com.infy.ekart.product.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infy.ekart.product.dto.ProductDTO;
import com.infy.ekart.product.entity.Category;
import com.infy.ekart.product.entity.DiscountType;
import com.infy.ekart.product.entity.Offer;
import com.infy.ekart.product.entity.Product;
import com.infy.ekart.product.entity.Unit;
import com.infy.ekart.product.exception.EKartProductException;
import com.infy.ekart.product.repository.CategoryRepository;
import com.infy.ekart.product.repository.OfferRepository;
import com.infy.ekart.product.repository.ProductRepository;

@Service(value = "customerProductService")
@Transactional
public class CustomerProductServiceImpl implements CustomerProductService {

	private static final int NEW_ARRIVAL_WINDOW_DAYS = 14;

	@Autowired
	private ProductRepository productRepository;

	@Autowired
	private CategoryRepository categoryRepository;

	@Autowired
	private OfferRepository offerRepository;

	@Override
	public List<ProductDTO> getAllProducts(Integer categoryId, String search, Boolean vegOnly,
			Boolean bestSellerOnly, Boolean newArrivalsOnly, Double minPrice, Double maxPrice, String sortBy)
			throws EKartProductException {

		List<Offer> activeOffers = offerRepository.findByActiveTrue().stream()
				.filter(Offer::isCurrentlyRunning)
				.collect(Collectors.toList());

		List<ProductDTO> productDTOs = productRepository.findAll().stream()
				.filter(Product::isAvailable)
				.filter(p -> categoryId == null || (p.getCategory() != null && categoryId.equals(p.getCategory().getCategoryId())))
				.filter(p -> search == null || search.isBlank()
						|| p.getName().toLowerCase().contains(search.toLowerCase())
						|| (p.getDescription() != null && p.getDescription().toLowerCase().contains(search.toLowerCase())))
				.filter(p -> vegOnly == null || !vegOnly || p.isVeg())
				.filter(p -> bestSellerOnly == null || !bestSellerOnly || p.isBestSeller())
				.filter(p -> newArrivalsOnly == null || !newArrivalsOnly || isNewArrival(p))
				.filter(p -> minPrice == null || p.getPrice() >= minPrice)
				.filter(p -> maxPrice == null || p.getPrice() <= maxPrice)
				.map(p -> mapToProductDTO(p, activeOffers))
				.collect(Collectors.toList());

		sort(productDTOs, sortBy);
		return productDTOs;
	}

	private void sort(List<ProductDTO> productDTOs, String sortBy) {
		if (sortBy == null) {
			return;
		}
		switch (sortBy) {
			case "priceLowToHigh":
				productDTOs.sort(Comparator.comparing(dto -> effectivePrice((ProductDTO) dto)));
				break;
			case "priceHighToLow":
				productDTOs.sort(Comparator.comparing((ProductDTO dto) -> effectivePrice(dto)).reversed());
				break;
			case "rating":
				productDTOs.sort(Comparator.comparing((ProductDTO dto) -> dto.getAvgRating() == null ? 0.0 : dto.getAvgRating()).reversed());
				break;
			case "newest":
				productDTOs.sort(Comparator.comparing(ProductDTO::isNewArrival).reversed());
				break;
			default:
				// unrecognised sort key: leave in natural (id) order
		}
	}

	private double effectivePrice(ProductDTO dto) {
		return dto.getDiscountedPrice() != null ? dto.getDiscountedPrice() : dto.getPrice();
	}

	private boolean isNewArrival(Product product) {
		return product.getCreatedAt() != null
				&& product.getCreatedAt().isAfter(LocalDateTime.now().minusDays(NEW_ARRIVAL_WINDOW_DAYS));
	}

	@Override
	public ProductDTO getProductById(Integer productId) throws EKartProductException {
		Product product = findProductOrThrow(productId);
		List<Offer> activeOffers = offerRepository.findByActiveTrue().stream()
				.filter(Offer::isCurrentlyRunning)
				.collect(Collectors.toList());
		return mapToProductDTO(product, activeOffers);
	}

	@Override
	public void reduceAvailableQuantity(Integer productId, Integer quantity) throws EKartProductException {
		Product product = findProductOrThrow(productId);
		if (quantity > product.getAvailableQuantity()) {
			throw new EKartProductException("ProductService.INSUFFICIENT_STOCK", HttpStatus.CONFLICT);
		}
		product.setAvailableQuantity(product.getAvailableQuantity() - quantity);
		productRepository.save(product);
	}

	@Override
	public ProductDTO createProduct(ProductDTO productDTO) throws EKartProductException {
		Product product = new Product();
		applyDtoToEntity(productDTO, product);
		product.setCreatedAt(LocalDateTime.now());
		productRepository.save(product);
		return mapToProductDTO(product, List.of());
	}

	@Override
	public ProductDTO updateProduct(Integer productId, ProductDTO productDTO) throws EKartProductException {
		Product product = findProductOrThrow(productId);
		applyDtoToEntity(productDTO, product);
		productRepository.save(product);
		return mapToProductDTO(product, List.of());
	}

	@Override
	public void deleteProduct(Integer productId) throws EKartProductException {
		Product product = findProductOrThrow(productId);
		productRepository.delete(product);
	}

	@Override
	public ProductDTO setAvailability(Integer productId, boolean available) throws EKartProductException {
		Product product = findProductOrThrow(productId);
		product.setAvailable(available);
		productRepository.save(product);
		return mapToProductDTO(product, List.of());
	}

	@Override
	public void updateProductRating(Integer productId, Double avgRating, Integer ratingCount) throws EKartProductException {
		Product product = findProductOrThrow(productId);
		product.setAvgRating(avgRating);
		product.setRatingCount(ratingCount);
		productRepository.save(product);
	}

	private Product findProductOrThrow(Integer productId) throws EKartProductException {
		Optional<Product> productOptional = productRepository.findById(productId);
		if (!productOptional.isPresent()) {
			throw new EKartProductException("ProductService.PRODUCT_NOT_AVAILABLE", HttpStatus.NOT_FOUND);
		}
		return productOptional.get();
	}

	private void applyDtoToEntity(ProductDTO productDTO, Product product) throws EKartProductException {
		Category category = categoryRepository.findById(productDTO.getCategoryId())
				.orElseThrow(() -> new EKartProductException("CategoryService.CATEGORY_NOT_FOUND", HttpStatus.NOT_FOUND));

		product.setName(productDTO.getName());
		product.setDescription(productDTO.getDescription());
		product.setCategory(category);
		product.setPrice(productDTO.getPrice());
		product.setAvailableQuantity(productDTO.getAvailableQuantity());
		product.setVeg(productDTO.isVeg());
		if (productDTO.getUnit() != null) {
			product.setUnit(Unit.valueOf(productDTO.getUnit()));
		}
		product.setUnitQuantity(productDTO.getUnitQuantity());
		product.setIngredients(productDTO.getIngredients());
		product.setAllergens(productDTO.getAllergens());
		product.setShelfLifeDays(productDTO.getShelfLifeDays());
		product.setImageUrl(productDTO.getImageUrl());
		product.setAvailable(productDTO.isAvailable());
		product.setBestSeller(productDTO.isBestSeller());
	}

	private ProductDTO mapToProductDTO(Product product, List<Offer> activeOffers) {
		ProductDTO productDTO = new ProductDTO();
		productDTO.setProductId(product.getProductId());
		productDTO.setName(product.getName());
		productDTO.setDescription(product.getDescription());
		if (product.getCategory() != null) {
			productDTO.setCategory(product.getCategory().getName());
			productDTO.setCategoryId(product.getCategory().getCategoryId());
		}
		productDTO.setPrice(product.getPrice());
		productDTO.setAvailableQuantity(product.getAvailableQuantity());
		productDTO.setVeg(product.isVeg());
		productDTO.setUnit(product.getUnit() != null ? product.getUnit().name() : null);
		productDTO.setUnitQuantity(product.getUnitQuantity());
		productDTO.setIngredients(product.getIngredients());
		productDTO.setAllergens(product.getAllergens());
		productDTO.setShelfLifeDays(product.getShelfLifeDays());
		productDTO.setImageUrl(product.getImageUrl());
		productDTO.setAvailable(product.isAvailable());
		productDTO.setBestSeller(product.isBestSeller());
		productDTO.setNewArrival(isNewArrival(product));
		productDTO.setAvgRating(product.getAvgRating());
		productDTO.setRatingCount(product.getRatingCount());

		applyBestOffer(productDTO, product, activeOffers);
		return productDTO;
	}

	private void applyBestOffer(ProductDTO productDTO, Product product, List<Offer> activeOffers) {
		Integer categoryId = product.getCategory() != null ? product.getCategory().getCategoryId() : null;

		Optional<Offer> bestOffer = activeOffers.stream()
				.filter(o -> product.getProductId().equals(o.getProductId())
						|| (o.getCategoryId() != null && o.getCategoryId().equals(categoryId)))
				.max(Comparator.comparing(o -> discountAmount(o, product.getPrice())));

		bestOffer.ifPresent(offer -> {
			double discounted = product.getPrice() - discountAmount(offer, product.getPrice());
			double discountedPrice = Math.max(0.0, discounted);
			productDTO.setDiscountedPrice(discountedPrice);
			productDTO.setDiscountPercent(Math.round((1 - discountedPrice / product.getPrice()) * 10000.0) / 100.0);
		});
	}

	private double discountAmount(Offer offer, double price) {
		if (offer.getDiscountType() == DiscountType.PERCENT) {
			return price * (offer.getDiscountValue() / 100.0);
		}
		return offer.getDiscountValue();
	}

}
