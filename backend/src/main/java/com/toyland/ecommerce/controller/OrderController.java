package com.toyland.ecommerce.controller;

import com.toyland.ecommerce.dto.ApiResponse;
import com.toyland.ecommerce.model.*;
import com.toyland.ecommerce.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;

    public OrderController(OrderRepository orderRepository,
                           OrderItemRepository orderItemRepository,
                           CartItemRepository cartItemRepository,
                           UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("User is not authenticated");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @PostMapping("/checkout")
    @Transactional
    public ResponseEntity<?> checkout(Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            List<CartItem> cartItems = cartItemRepository.findByUserUserId(user.getUserId());

            if (cartItems.isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Cart is empty!"));
            }

            BigDecimal totalAmount = BigDecimal.ZERO;
            for (CartItem item : cartItems) {
                BigDecimal itemTotal = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                totalAmount = totalAmount.add(itemTotal);
            }

            String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Order order = new Order(orderId, user, totalAmount, OrderStatus.SUCCESS, LocalDateTime.now(), LocalDateTime.now());
            Order savedOrder = orderRepository.save(order);

            for (CartItem item : cartItems) {
                BigDecimal pricePerUnit = item.getProduct().getPrice();
                BigDecimal itemTotalPrice = pricePerUnit.multiply(BigDecimal.valueOf(item.getQuantity()));

                OrderItem orderItem = new OrderItem(savedOrder, item.getProduct(), item.getQuantity(), pricePerUnit, itemTotalPrice);
                orderItemRepository.save(orderItem);
            }

            // Clear Cart
            cartItemRepository.deleteByUserUserId(user.getUserId());

            Map<String, Object> result = new HashMap<>();
            result.put("orderId", savedOrder.getOrderId());
            result.put("totalAmount", savedOrder.getTotalAmount());
            result.put("status", savedOrder.getStatus());
            result.put("createdAt", savedOrder.getCreatedAt());
            result.put("message", "Order placed successfully!");

            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserOrders(Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            List<Order> orders = orderRepository.findByUserUserIdOrderByCreatedAtDesc(user.getUserId());
            return ResponseEntity.ok(orders);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(new ApiResponse(false, e.getMessage()));
        }
    }
}
