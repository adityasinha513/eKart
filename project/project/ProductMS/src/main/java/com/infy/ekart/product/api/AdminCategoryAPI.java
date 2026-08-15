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

import com.infy.ekart.product.dto.CategoryDTO;
import com.infy.ekart.product.exception.EKartProductException;
import com.infy.ekart.product.service.CategoryService;

@RestController
@RequestMapping(value = "/admin-api/categories")
public class AdminCategoryAPI {

	@Autowired
	private CategoryService categoryService;

	@Autowired
	private Environment environment;

	@PostMapping
	public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CategoryDTO categoryDTO)
			throws EKartProductException {
		return new ResponseEntity<>(categoryService.createCategory(categoryDTO), HttpStatus.CREATED);
	}

	@PutMapping(value = "/{categoryId}")
	public ResponseEntity<CategoryDTO> updateCategory(@PathVariable Integer categoryId,
			@Valid @RequestBody CategoryDTO categoryDTO) throws EKartProductException {
		return new ResponseEntity<>(categoryService.updateCategory(categoryId, categoryDTO), HttpStatus.OK);
	}

	@DeleteMapping(value = "/{categoryId}")
	public ResponseEntity<String> deleteCategory(@PathVariable Integer categoryId) throws EKartProductException {
		categoryService.deleteCategory(categoryId);
		return new ResponseEntity<>(environment.getProperty("AdminCategoryAPI.CATEGORY_DELETED"), HttpStatus.OK);
	}

}
