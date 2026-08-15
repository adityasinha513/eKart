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
		return categoryRepository.findAllByOrderByDisplayOrderAsc().stream()
				.map(this::mapToDTO)
				.collect(Collectors.toList());
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
