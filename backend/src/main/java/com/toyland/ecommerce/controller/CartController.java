package com.toyland.ecommerce.controller;

import com.toyland.ecommerce.dto.AddToCartRequest;
import com.toyland.ecommerce.dto.ApiResponse;
import com.toyland.ecommerce.dto.CartItemDto;
import com.toyland.ecommerce.dto.CartResponseDto;
import com.toyland.ecommerce.dto.UpdateCartQuantityRequest;
import com.toyland.ecommerce.model.CartItem;
import com.toyland.ecommerce.model.Product;
import com.toyland.ecommerce.model.ProductImage;
import com.toyland.ecommerce.model.User;
import com.toyland.ecommerce.repository.CartItemRepository;
import com.toyland.ecommerce.repository.ProductImageRepository;
import com.toyland.ecommerce.repository.ProductRepository;
import com.toyland.ecommerce.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private static final String DEFAULT_PLACEHOLDER_IMAGE = "https://ik.imagekit.io/StringStackSwathi/SoftToys/SoftToys/Teddy%20Bear.jpg";

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    public CartController(CartItemRepository cartItemRepository,
                          UserRepository userRepository,
                          ProductRepository productRepository,
                          ProductImageRepository productImageRepository) {
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
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

    @GetMapping
    public ResponseEntity<?> getCart(Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            List<CartItem> cartItems = cartItemRepository.findByUserUserId(user.getUserId());

            List<ProductImage> allImages = productImageRepository.findAll();
            Map<Long, List<ProductImage>> imagesMap = allImages.stream()
                    .filter(img -> img.getProduct() != null && img.getProduct().getProductId() != null)
                    .collect(Collectors.groupingBy(img -> img.getProduct().getProductId()));

            List<CartItemDto> itemDtos = cartItems.stream().map(item -> {
                CartItemDto dto = new CartItemDto();
                dto.setCartId(item.getCartId());
                dto.setProductId(item.getProduct().getProductId());
                dto.setProductName(item.getProduct().getName());
                dto.setDescription(item.getProduct().getDescription());
                dto.setPrice(item.getProduct().getPrice());
                dto.setQuantity(item.getQuantity());
                dto.setStock(item.getProduct().getStock());

                BigDecimal totalItemPrice = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                dto.setTotalItemPrice(totalItemPrice);

                List<ProductImage> images = imagesMap.getOrDefault(item.getProduct().getProductId(), Collections.emptyList());
                if (!images.isEmpty()) {
                    dto.setImageUrl(images.get(0).getImageUrl());
                } else {
                    dto.setImageUrl(DEFAULT_PLACEHOLDER_IMAGE);
                }
                return dto;
            }).collect(Collectors.toList());

            int totalItemsCount = itemDtos.stream().mapToInt(CartItemDto::getQuantity).sum();
            BigDecimal grandTotal = itemDtos.stream()
                    .map(CartItemDto::getTotalItemPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            return ResponseEntity.ok(new CartResponseDto(itemDtos, totalItemsCount, grandTotal));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/items")
    @Transactional
    public ResponseEntity<?> addToCart(@Valid @RequestBody AddToCartRequest request, Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found"));

            Optional<CartItem> existingItemOpt = cartItemRepository.findByUserUserIdAndProductProductId(user.getUserId(), product.getProductId());

            if (existingItemOpt.isPresent()) {
                CartItem existingItem = existingItemOpt.get();
                existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
                cartItemRepository.save(existingItem);
            } else {
                CartItem newItem = new CartItem(user, product, request.getQuantity());
                cartItemRepository.save(newItem);
            }

            return ResponseEntity.ok(new ApiResponse(true, "Product added to cart successfully!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/items/{cartItemId}")
    @Transactional
    public ResponseEntity<?> updateCartQuantity(@PathVariable Long cartItemId,
                                                @Valid @RequestBody UpdateCartQuantityRequest request,
                                                Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            CartItem cartItem = cartItemRepository.findById(cartItemId)
                    .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

            if (!cartItem.getUser().getUserId().equals(user.getUserId())) {
                return ResponseEntity.status(403).body(new ApiResponse(false, "Unauthorized action"));
            }

            cartItem.setQuantity(request.getQuantity());
            cartItemRepository.save(cartItem);

            return ResponseEntity.ok(new ApiResponse(true, "Cart item quantity updated!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/items/{cartItemId}")
    @Transactional
    public ResponseEntity<?> removeCartItem(@PathVariable Long cartItemId, Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            CartItem cartItem = cartItemRepository.findById(cartItemId)
                    .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

            if (!cartItem.getUser().getUserId().equals(user.getUserId())) {
                return ResponseEntity.status(403).body(new ApiResponse(false, "Unauthorized action"));
            }

            cartItemRepository.delete(cartItem);
            return ResponseEntity.ok(new ApiResponse(true, "Item removed from cart"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
