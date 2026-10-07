package com.infy.ekart.product.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infy.ekart.product.dto.CategoryDTO;
import com.infy.ekart.product.entity.Category;
import com.infy.ekart.product.exception.EKartProductException;
import com.infy.ekart.product.repository.CategoryRepository;
import com.infy.ekart.product.repository.ProductRepository;

@Service(value = "categoryService")
@Transactional
public class CategoryServiceImpl implements CategoryService {

	@Autowired
	private CategoryRepository categoryRepository;

	@Autowired
	private ProductRepository productRepository;

	@Override
	public List<CategoryDTO> getAllCategories() {
		java.util.Map<String, Category> groups = new java.util.LinkedHashMap<>();
		for (Category category : categoryRepository.findAllByOrderByDisplayOrderAsc()) {
			String displayName = customerCategoryName(category.getName());
			if (displayName != null) groups.putIfAbsent(displayName, category);
		}
		return java.util.List.of("Sweet", "Namkeen", "Beverages").stream()
				.filter(groups::containsKey)
				.map(name -> { CategoryDTO dto = mapToDTO(groups.get(name)); dto.setName(name); return dto; })
				.collect(Collectors.toList());
	}

	private String customerCategoryName(String name) {
		String normalized = name == null ? "" : name.trim().toLowerCase(java.util.Locale.ROOT);
		if (java.util.Set.of("mithai", "bengali sweets", "sweet", "sweets").contains(normalized)) return "Sweet";
		if (normalized.equals("namkeen")) return "Namkeen";
		if (java.util.Set.of("beverages", "beverage", "drinks").contains(normalized)) return "Beverages";
		return null;
	}

	@Override
	public CategoryDTO createCategory(CategoryDTO categoryDTO) {
		Category category = new Category();
		applyDtoToEntity(categoryDTO, category);
		categoryRepository.save(category);
		return mapToDTO(category);
	}

	@Override
	public CategoryDTO updateCategory(Integer categoryId, CategoryDTO categoryDTO) throws EKartProductException {
		Category category = categoryRepository.findById(categoryId)
				.orElseThrow(() -> new EKartProductException("CategoryService.CATEGORY_NOT_FOUND", HttpStatus.NOT_FOUND));
		applyDtoToEntity(categoryDTO, category);
		categoryRepository.save(category);
		return mapToDTO(category);
	}

	@Override
	public void deleteCategory(Integer categoryId) throws EKartProductException {
		Category category = categoryRepository.findById(categoryId)
				.orElseThrow(() -> new EKartProductException("CategoryService.CATEGORY_NOT_FOUND", HttpStatus.NOT_FOUND));
		if (!productRepository.findByCategory_CategoryId(categoryId).isEmpty()) {
			throw new EKartProductException("CategoryService.CATEGORY_IN_USE", HttpStatus.CONFLICT);
		}
		categoryRepository.delete(category);
	}

	private void applyDtoToEntity(CategoryDTO categoryDTO, Category category) {
		category.setName(categoryDTO.getName());
		category.setDescription(categoryDTO.getDescription());
		category.setImageUrl(categoryDTO.getImageUrl());
		category.setDisplayOrder(categoryDTO.getDisplayOrder() != null ? categoryDTO.getDisplayOrder() : 0);
	}

	private CategoryDTO mapToDTO(Category category) {
		CategoryDTO categoryDTO = new CategoryDTO();
		categoryDTO.setCategoryId(category.getCategoryId());
		categoryDTO.setName(category.getName());
		categoryDTO.setDescription(category.getDescription());
		categoryDTO.setImageUrl(category.getImageUrl());
		categoryDTO.setDisplayOrder(category.getDisplayOrder());
		return categoryDTO;
	}

}
