package com.infy.ekart.product.api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.ekart.product.dto.CategoryDTO;
import com.infy.ekart.product.service.CategoryService;

@RestController
@RequestMapping(value = "/category-api")
public class CategoryAPI {

	@Autowired
	private CategoryService categoryService;

	@GetMapping(value = "/categories")
	public ResponseEntity<List<CategoryDTO>> getAllCategories() {
		return new ResponseEntity<>(categoryService.getAllCategories(), HttpStatus.OK);
	}

}
