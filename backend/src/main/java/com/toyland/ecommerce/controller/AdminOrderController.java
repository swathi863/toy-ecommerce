package com.toyland.ecommerce.controller;

import com.toyland.ecommerce.dto.AdminOrderDto;
import com.toyland.ecommerce.dto.AdminUpdateOrderStatusRequest;
import com.toyland.ecommerce.dto.ApiResponse;
import com.toyland.ecommerce.dto.OrderItemResponseDto;
import com.toyland.ecommerce.model.*;
import com.toyland.ecommerce.repository.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductImageRepository productImageRepository;
    private final UserRepository userRepository;

    public AdminOrderController(OrderRepository orderRepository,
                                OrderItemRepository orderItemRepository,
                                ProductImageRepository productImageRepository,
                                UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
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

    private AdminOrderDto mapToAdminOrderDto(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrderOrderId(order.getOrderId());
        List<OrderItemResponseDto> itemDtos = new ArrayList<>();

        for (OrderItem item : items) {
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

        String paymentStatus = "Paid";
        if (order.getStatus() == OrderStatus.FAILED) {
            paymentStatus = "Failed";
        } else if (order.getStatus() == OrderStatus.PENDING) {
            paymentStatus = "Pending";
        }

        User customer = order.getUser();

        return new AdminOrderDto(
                order.getOrderId(),
                customer != null ? customer.getUserId() : null,
                customer != null ? customer.getUserName() : "Customer",
                customer != null ? customer.getEmail() : "customer@toyland.com",
                order.getCreatedAt(),
                order.getTotalAmount(),
                paymentStatus,
                order.getStatus(),
                itemDtos
        );
    }

    @GetMapping
    public ResponseEntity<?> getAllOrders(Authentication authentication) {
        try {
            verifyAdmin(authentication);
            List<Order> orders = orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
            List<AdminOrderDto> dtos = orders.stream().map(this::mapToAdminOrderDto).collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable String orderId, Authentication authentication) {
        try {
            verifyAdmin(authentication);
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));
            return ResponseEntity.ok(mapToAdminOrderDto(order));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{orderId}/status")
    @Transactional
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderId,
                                                @Valid @RequestBody AdminUpdateOrderStatusRequest request,
                                                Authentication authentication) {
        try {
            verifyAdmin(authentication);
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

            order.setStatus(request.getStatus());
            order.setUpdatedAt(LocalDateTime.now());
            Order updatedOrder = orderRepository.save(order);

            return ResponseEntity.ok(mapToAdminOrderDto(updatedOrder));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
