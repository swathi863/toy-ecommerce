package com.toyland.ecommerce.controller;

import com.toyland.ecommerce.dto.ApiResponse;
import com.toyland.ecommerce.dto.WishlistItemDto;
import com.toyland.ecommerce.model.Product;
import com.toyland.ecommerce.model.ProductImage;
import com.toyland.ecommerce.model.User;
import com.toyland.ecommerce.model.WishlistItem;
import com.toyland.ecommerce.repository.ProductImageRepository;
import com.toyland.ecommerce.repository.ProductRepository;
import com.toyland.ecommerce.repository.UserRepository;
import com.toyland.ecommerce.repository.WishlistRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private static final String DEFAULT_PLACEHOLDER_IMAGE = "https://ik.imagekit.io/StringStackSwathi/SoftToys/SoftToys/Teddy%20Bear.jpg";

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductImageRepository productImageRepository;

    public WishlistController(WishlistRepository wishlistRepository,
                              ProductRepository productRepository,
                              UserRepository userRepository,
                              ProductImageRepository productImageRepository) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.productImageRepository = productImageRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("User is not authenticated");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    private WishlistItemDto convertToDto(WishlistItem item, Map<Long, List<ProductImage>> imagesMap) {
        Product p = item.getProduct();
        List<String> imageUrls = new ArrayList<>();
        String primaryImage = DEFAULT_PLACEHOLDER_IMAGE;

        if (p != null) {
            List<ProductImage> pImages = imagesMap.getOrDefault(p.getProductId(), Collections.emptyList());
            if (!pImages.isEmpty()) {
                imageUrls = pImages.stream().map(ProductImage::getImageUrl).collect(Collectors.toList());
                primaryImage = pImages.get(0).getImageUrl();
            }
        }

        boolean inStock = p != null && p.getStock() != null && p.getStock() > 0;

        return new WishlistItemDto(
                item.getWishlistId(),
                p != null ? p.getProductId() : null,
                p != null ? p.getName() : "Unknown Product",
                p != null ? p.getDescription() : "",
                p != null ? p.getPrice() : null,
                p != null ? p.getStock() : 0,
                primaryImage,
                imageUrls,
                inStock
        );
    }

    @GetMapping
    public ResponseEntity<?> getWishlist(Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            List<WishlistItem> items = wishlistRepository.findByUserUserIdOrderByCreatedAtDesc(user.getUserId());

            List<ProductImage> allImages = productImageRepository.findAll();
            Map<Long, List<ProductImage>> imagesMap = allImages.stream()
                    .filter(img -> img.getProduct() != null && img.getProduct().getProductId() != null)
                    .collect(Collectors.groupingBy(img -> img.getProduct().getProductId()));

            List<WishlistItemDto> dtos = items.stream()
                    .map(item -> convertToDto(item, imagesMap))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/toggle/{productId}")
    @Transactional
    public ResponseEntity<?> toggleWishlist(@PathVariable Long productId, Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            Optional<WishlistItem> existing = wishlistRepository.findByUserUserIdAndProductProductId(user.getUserId(), productId);

            Map<String, Object> response = new HashMap<>();
            if (existing.isPresent()) {
                wishlistRepository.delete(existing.get());
                response.put("success", true);
                response.put("action", "removed");
                response.put("message", "Removed from Wishlist");
                response.put("inWishlist", false);
            } else {
                Product product = productRepository.findById(productId)
                        .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));
                WishlistItem newItem = new WishlistItem(user, product);
                wishlistRepository.save(newItem);
                response.put("success", true);
                response.put("action", "added");
                response.put("message", "Added to Wishlist");
                response.put("inWishlist", true);
            }
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/add/{productId}")
    @Transactional
    public ResponseEntity<?> addToWishlist(@PathVariable Long productId, Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            boolean exists = wishlistRepository.existsByUserUserIdAndProductProductId(user.getUserId(), productId);

            if (exists) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "action", "exists",
                        "message", "Product is already in your Wishlist",
                        "inWishlist", true
                ));
            }

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));

            WishlistItem newItem = new WishlistItem(user, product);
            wishlistRepository.save(newItem);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "action", "added",
                    "message", "Added to Wishlist",
                    "inWishlist", true
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/remove/{productId}")
    @Transactional
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long productId, Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            wishlistRepository.deleteByUserUserIdAndProductProductId(user.getUserId(), productId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "action", "removed",
                    "message", "Removed from Wishlist",
                    "inWishlist", false
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<?> checkWishlistStatus(@PathVariable Long productId, Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            boolean exists = wishlistRepository.existsByUserUserIdAndProductProductId(user.getUserId(), productId);
            return ResponseEntity.ok(Map.of("inWishlist", exists));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("inWishlist", false));
        }
    }
}
