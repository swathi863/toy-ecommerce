package com.toyland.ecommerce.repository;

import com.toyland.ecommerce.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryCategoryId(Long categoryId);

    List<Product> findByNameContainingIgnoreCase(String keyword);
}
