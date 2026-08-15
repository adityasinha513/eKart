package com.infy.ekart.product.service;

import java.util.List;

import com.infy.ekart.product.dto.CategoryDTO;
import com.infy.ekart.product.exception.EKartProductException;

public interface CategoryService {

	List<CategoryDTO> getAllCategories();

	CategoryDTO createCategory(CategoryDTO categoryDTO) throws EKartProductException;

	CategoryDTO updateCategory(Integer categoryId, CategoryDTO categoryDTO) throws EKartProductException;

	void deleteCategory(Integer categoryId) throws EKartProductException;

}
