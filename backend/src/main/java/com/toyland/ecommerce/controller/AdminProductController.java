package com.toyland.ecommerce.controller;

import com.toyland.ecommerce.dto.AdminProductRequest;
import com.toyland.ecommerce.dto.ApiResponse;
import com.toyland.ecommerce.dto.ProductDto;
import com.toyland.ecommerce.model.*;
import com.toyland.ecommerce.repository.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private static final String DEFAULT_PLACEHOLDER_IMAGE = "https://ik.imagekit.io/StringStackSwathi/SoftToys/SoftToys/Teddy%20Bear.jpg";

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final UserRepository userRepository;

    public AdminProductController(ProductRepository productRepository,
                                  CategoryRepository categoryRepository,
                                  ProductImageRepository productImageRepository,
                                  UserRepository userRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
        this.userRepository = userRepository;
    }

    private User verifyAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Authentication required. Please log in.");
        }
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("You do not have permission to access the admin panel.");
        }
        return user;
    }

    private Map<Long, List<ProductImage>> fetchImagesMap() {
        List<ProductImage> allImages = productImageRepository.findAll();
        return allImages.stream()
                .filter(img -> img.getProduct() != null && img.getProduct().getProductId() != null)
                .collect(Collectors.groupingBy(img -> img.getProduct().getProductId()));
    }

    private ProductDto mapToDtoWithImages(Product product, List<ProductImage> images) {
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

        if (images != null && !images.isEmpty()) {
            dto.setImageUrl(images.get(0).getImageUrl());
            dto.setImages(images.stream().map(ProductImage::getImageUrl).collect(Collectors.toList()));
        } else {
            dto.setImageUrl(DEFAULT_PLACEHOLDER_IMAGE);
            dto.setImages(List.of(DEFAULT_PLACEHOLDER_IMAGE));
        }

        return dto;
    }

    @GetMapping
    public ResponseEntity<?> getAllProducts(Authentication authentication) {
        try {
            verifyAdmin(authentication);
            List<Product> products = productRepository.findAll();
            Map<Long, List<ProductImage>> imagesMap = fetchImagesMap();

            List<ProductDto> dtos = products.stream()
                    .map(product -> mapToDtoWithImages(product, imagesMap.getOrDefault(product.getProductId(), Collections.emptyList())))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> addProduct(@Valid @RequestBody AdminProductRequest request, Authentication authentication) {
        try {
            verifyAdmin(authentication);
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + request.getCategoryId()));

            Product product = new Product();
            product.setName(request.getName().trim());
            product.setDescription(request.getDescription());
            product.setPrice(request.getPrice());
            product.setStock(request.getStock());
            product.setCategory(category);
            product.setCreatedAt(LocalDateTime.now());
            product.setUpdatedAt(LocalDateTime.now());

            Product savedProduct = productRepository.save(product);

            if (request.getImageUrl() != null && !request.getImageUrl().trim().isEmpty()) {
                ProductImage image = new ProductImage(savedProduct, request.getImageUrl().trim());
                productImageRepository.save(image);
            }

            List<ProductImage> images = productImageRepository.findByProductProductId(savedProduct.getProductId());
            return ResponseEntity.ok(mapToDtoWithImages(savedProduct, images));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{productId}")
    @Transactional
    public ResponseEntity<?> updateProduct(@PathVariable Long productId,
                                           @Valid @RequestBody AdminProductRequest request,
                                           Authentication authentication) {
        try {
            verifyAdmin(authentication);
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));

            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + request.getCategoryId()));

            product.setName(request.getName().trim());
            product.setDescription(request.getDescription());
            product.setPrice(request.getPrice());
            product.setStock(request.getStock());
            product.setCategory(category);
            product.setUpdatedAt(LocalDateTime.now());

            Product updatedProduct = productRepository.save(product);

            if (request.getImageUrl() != null && !request.getImageUrl().trim().isEmpty()) {
                List<ProductImage> existingImages = productImageRepository.findByProductProductId(productId);
                if (!existingImages.isEmpty()) {
                    ProductImage img = existingImages.get(0);
                    img.setImageUrl(request.getImageUrl().trim());
                    productImageRepository.save(img);
                } else {
                    ProductImage img = new ProductImage(updatedProduct, request.getImageUrl().trim());
                    productImageRepository.save(img);
                }
            }

            List<ProductImage> images = productImageRepository.findByProductProductId(productId);
            return ResponseEntity.ok(mapToDtoWithImages(updatedProduct, images));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{productId}")
    @Transactional
    public ResponseEntity<?> deleteProduct(@PathVariable Long productId, Authentication authentication) {
        try {
            verifyAdmin(authentication);
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));

            // Delete associated product images first
            List<ProductImage> images = productImageRepository.findByProductProductId(productId);
            productImageRepository.deleteAll(images);

            // Delete product
            productRepository.delete(product);

            return ResponseEntity.ok(new ApiResponse(true, "Product deleted successfully!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
