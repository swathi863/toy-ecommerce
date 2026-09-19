package com.toyland.ecommerce.controller;

import com.toyland.ecommerce.dto.ProductDto;
import com.toyland.ecommerce.model.Product;
import com.toyland.ecommerce.model.ProductImage;
import com.toyland.ecommerce.repository.ProductImageRepository;
import com.toyland.ecommerce.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    public ProductController(ProductRepository productRepository, ProductImageRepository productImageRepository) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
    }

    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        List<Product> products = productRepository.findAll();
        List<ProductDto> dtos = products.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductDto>> getProductsByCategory(@PathVariable Long categoryId) {
        List<Product> products = productRepository.findByCategoryCategoryId(categoryId);
        List<ProductDto> dtos = products.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<?> getProductById(@PathVariable Long productId) {
        return productRepository.findById(productId)
                .map(product -> ResponseEntity.ok(mapToDto(product)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{productId}/images")
    public ResponseEntity<List<String>> getProductImages(@PathVariable Long productId) {
        List<ProductImage> images = productImageRepository.findByProductProductId(productId);
        List<String> imageUrls = images.stream()
                .map(ProductImage::getImageUrl)
                .collect(Collectors.toList());
        return ResponseEntity.ok(imageUrls);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductDto>> searchProducts(@RequestParam String keyword) {
        List<Product> products = productRepository.findByNameContainingIgnoreCase(keyword);
        List<ProductDto> dtos = products.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private ProductDto mapToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setProductId(product.getProductId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getCategoryId());
            dto.setCategoryName(product.getCategory().getCategoryName());
        }

        List<ProductImage> images = productImageRepository.findByProductProductId(product.getProductId());
        if (!images.isEmpty()) {
            dto.setImageUrl(images.get(0).getImageUrl());
            dto.setImages(images.stream().map(ProductImage::getImageUrl).collect(Collectors.toList()));
        } else {
            // Default placeholder image
            dto.setImageUrl("https://ik.imagekit.io/StringStackSwathi/SoftToys/SoftToys/Teddy%20Bear.jpg");
            dto.setImages(List.of("https://ik.imagekit.io/StringStackSwathi/SoftToys/SoftToys/Teddy%20Bear.jpg"));
        }

        return dto;
    }
}
