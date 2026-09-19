package com.toyland.ecommerce.controller;

import com.toyland.ecommerce.dto.ApiResponse;
import com.toyland.ecommerce.dto.OrderItemResponseDto;
import com.toyland.ecommerce.dto.OrderResponseDto;
import com.toyland.ecommerce.model.*;
import com.toyland.ecommerce.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductImageRepository productImageRepository;

    public OrderController(OrderRepository orderRepository,
                           OrderItemRepository orderItemRepository,
                           CartItemRepository cartItemRepository,
                           UserRepository userRepository,
                           ProductImageRepository productImageRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
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

    private OrderResponseDto mapToOrderResponseDto(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrderOrderId(order.getOrderId());
        
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItemResponseDto> itemDtos = new ArrayList<>();

        for (OrderItem item : items) {
            subtotal = subtotal.add(item.getTotalPrice() != null ? item.getTotalPrice() : BigDecimal.ZERO);

            String imageUrl = "https://ik.imagekit.io/StringStackSwathi/SoftToys/SoftToys/Teddy%20Bear.jpg";
            if (item.getProduct() != null) {
                List<ProductImage> images = productImageRepository.findByProductProductId(item.getProduct().getProductId());
                if (!images.isEmpty()) {
                    imageUrl = images.get(0).getImageUrl();
                }
            }

            OrderItemResponseDto itemDto = new OrderItemResponseDto(
                    item.getOrderItemsId(),
                    item.getProduct() != null ? item.getProduct().getProductId() : null,
                    item.getProduct() != null ? item.getProduct().getName() : "Toy Product",
                    item.getQuantity(),
                    item.getPricePerUnit(),
                    item.getTotalPrice(),
                    imageUrl
            );
            itemDtos.add(itemDto);
        }

        BigDecimal shippingFee = BigDecimal.valueOf(50.00);
        BigDecimal totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : subtotal.add(shippingFee);

        String paymentStatus = "Paid";
        if (order.getStatus() == OrderStatus.FAILED) {
            paymentStatus = "Failed";
        } else if (order.getStatus() == OrderStatus.PENDING) {
            paymentStatus = "Pending";
        }


        return new OrderResponseDto(
                order.getOrderId(),
                totalAmount,
                subtotal,
                shippingFee,
                order.getStatus(),
                paymentStatus,
                order.getCreatedAt(),
                itemDtos
        );
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            List<Order> orders = orderRepository.findByUserUserIdOrderByCreatedAtDesc(user.getUserId());
            
            List<OrderResponseDto> responseDtos = orders.stream()
                    .map(this::mapToOrderResponseDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responseDtos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable String orderId, Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

            if (!order.getUser().getUserId().equals(user.getUserId())) {
                return ResponseEntity.status(403).body(new ApiResponse(false, "Access denied. You can only view your own orders."));
            }

            return ResponseEntity.ok(mapToOrderResponseDto(order));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserOrders(Authentication authentication) {
        return getMyOrders(authentication);
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

            BigDecimal subtotal = BigDecimal.ZERO;
            for (CartItem item : cartItems) {
                BigDecimal itemTotal = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                subtotal = subtotal.add(itemTotal);
            }

            BigDecimal shippingFee = BigDecimal.valueOf(50.00);
            BigDecimal grandTotal = subtotal.add(shippingFee);

            String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Order order = new Order(orderId, user, grandTotal, OrderStatus.SUCCESS, LocalDateTime.now(), LocalDateTime.now());
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
}
