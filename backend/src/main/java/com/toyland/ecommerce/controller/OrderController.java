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
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final String DEFAULT_PLACEHOLDER_IMAGE = "https://ik.imagekit.io/StringStackSwathi/SoftToys/SoftToys/Teddy%20Bear.jpg";
    private static final int RETURN_PERIOD_DAYS = 10;

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

    /**
     * Calculates 10-day return eligibility based on ACTUAL delivery date (delivery_date).
     */
    private boolean isWithinReturnPeriod(OrderItem item, Order order) {
        if (item == null) {
            return false;
        }

        // If delivery_date is missing, initialize it from order creation/delivery date
        if (item.getDeliveryDate() == null && order != null && order.getCreatedAt() != null) {
            item.setDeliveryDate(order.getCreatedAt());
            orderItemRepository.save(item);
        }

        if (item.getDeliveryDate() == null) {
            return false;
        }

        long daysBetween = ChronoUnit.DAYS.between(item.getDeliveryDate(), LocalDateTime.now());
        return daysBetween <= RETURN_PERIOD_DAYS;
    }

    private void checkAndUpdateRefundStatus(OrderItem item) {
        if ("RETURN_REQUESTED".equalsIgnoreCase(item.getReturnStatus()) && item.getReturnRequestedAt() != null) {
            // Auto-transition to REFUND_COMPLETED if 1 day passed or requested on a previous day/date
            boolean isNextDay = item.getReturnRequestedAt().toLocalDate().isBefore(LocalDateTime.now().toLocalDate())
                    || item.getReturnRequestedAt().plusMinutes(1).isBefore(LocalDateTime.now());
            if (isNextDay) {
                item.setReturnStatus("REFUND_COMPLETED");
                orderItemRepository.save(item);
            }
        }
    }

    @GetMapping("/my-orders")
    @Transactional
    public ResponseEntity<?> getMyOrders(Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            List<Order> orders = orderRepository.findByUserUserIdOrderByCreatedAtDesc(user.getUserId());
            if (orders.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            List<String> orderIds = orders.stream().map(Order::getOrderId).collect(Collectors.toList());
            List<OrderItem> allOrderItems = orderItemRepository.findAll().stream()
                    .filter(item -> item.getOrder() != null && orderIds.contains(item.getOrder().getOrderId()))
                    .collect(Collectors.toList());

            Map<String, List<OrderItem>> itemsByOrderId = allOrderItems.stream()
                    .collect(Collectors.groupingBy(item -> item.getOrder().getOrderId()));

            List<ProductImage> allImages = productImageRepository.findAll();
            Map<Long, List<ProductImage>> imagesMap = allImages.stream()
                    .filter(img -> img.getProduct() != null && img.getProduct().getProductId() != null)
                    .collect(Collectors.groupingBy(img -> img.getProduct().getProductId()));

            List<OrderResponseDto> responseDtos = orders.stream().map(order -> {
                List<OrderItem> items = itemsByOrderId.getOrDefault(order.getOrderId(), Collections.emptyList());
                BigDecimal subtotal = BigDecimal.ZERO;
                List<OrderItemResponseDto> itemDtos = new ArrayList<>();

                for (OrderItem item : items) {
                    checkAndUpdateRefundStatus(item);

                    subtotal = subtotal.add(item.getTotalPrice() != null ? item.getTotalPrice() : BigDecimal.ZERO);

                    String imageUrl = DEFAULT_PLACEHOLDER_IMAGE;
                    if (item.getProduct() != null) {
                        List<ProductImage> images = imagesMap.getOrDefault(item.getProduct().getProductId(), Collections.emptyList());
                        if (!images.isEmpty()) {
                            imageUrl = images.get(0).getImageUrl();
                        }
                    }

                    String currentReturnStatus = item.getReturnStatus();
                    boolean itemEligible = isWithinReturnPeriod(item, order) && "NONE".equalsIgnoreCase(currentReturnStatus);

                    OrderItemResponseDto itemDto = new OrderItemResponseDto(
                            item.getOrderItemsId(),
                            item.getProduct() != null ? item.getProduct().getProductId() : null,
                            item.getProduct() != null ? item.getProduct().getName() : "Toy Product",
                            item.getQuantity(),
                            item.getPricePerUnit(),
                            item.getTotalPrice(),
                            imageUrl,
                            currentReturnStatus,
                            itemEligible,
                            item.getReturnRequestedAt(),
                            item.getDeliveryDate()
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

                OrderResponseDto dto = new OrderResponseDto(
                        order.getOrderId(),
                        totalAmount,
                        subtotal,
                        shippingFee,
                        order.getStatus(),
                        paymentStatus,
                        order.getCreatedAt(),
                        itemDtos
                );
                dto.setFullName(order.getFullName());
                dto.setPhoneNumber(order.getPhoneNumber());
                dto.setAddressLine1(order.getAddressLine1());
                dto.setAddressLine2(order.getAddressLine2());
                dto.setCity(order.getCity());
                dto.setState(order.getState());
                dto.setPincode(order.getPincode());
                return dto;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(responseDtos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{orderId}")
    @Transactional
    public ResponseEntity<?> getOrderById(@PathVariable String orderId, Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

            if (!order.getUser().getUserId().equals(user.getUserId())) {
                return ResponseEntity.status(403).body(new ApiResponse(false, "Access denied. You can only view your own orders."));
            }

            List<OrderItem> items = orderItemRepository.findByOrderOrderId(order.getOrderId());
            List<ProductImage> allImages = productImageRepository.findAll();
            Map<Long, List<ProductImage>> imagesMap = allImages.stream()
                    .filter(img -> img.getProduct() != null && img.getProduct().getProductId() != null)
                    .collect(Collectors.groupingBy(img -> img.getProduct().getProductId()));

            BigDecimal subtotal = BigDecimal.ZERO;
            List<OrderItemResponseDto> itemDtos = new ArrayList<>();

            for (OrderItem item : items) {
                checkAndUpdateRefundStatus(item);

                subtotal = subtotal.add(item.getTotalPrice() != null ? item.getTotalPrice() : BigDecimal.ZERO);

                String imageUrl = DEFAULT_PLACEHOLDER_IMAGE;
                if (item.getProduct() != null) {
                    List<ProductImage> images = imagesMap.getOrDefault(item.getProduct().getProductId(), Collections.emptyList());
                    if (!images.isEmpty()) {
                        imageUrl = images.get(0).getImageUrl();
                    }
                }

                String currentReturnStatus = item.getReturnStatus();
                boolean itemEligible = isWithinReturnPeriod(item, order) && "NONE".equalsIgnoreCase(currentReturnStatus);

                OrderItemResponseDto itemDto = new OrderItemResponseDto(
                        item.getOrderItemsId(),
                        item.getProduct() != null ? item.getProduct().getProductId() : null,
                        item.getProduct() != null ? item.getProduct().getName() : "Toy Product",
                        item.getQuantity(),
                        item.getPricePerUnit(),
                        item.getTotalPrice(),
                        imageUrl,
                        currentReturnStatus,
                        itemEligible,
                        item.getReturnRequestedAt(),
                        item.getDeliveryDate()
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

            OrderResponseDto responseDto = new OrderResponseDto(
                    order.getOrderId(),
                    totalAmount,
                    subtotal,
                    shippingFee,
                    order.getStatus(),
                    paymentStatus,
                    order.getCreatedAt(),
                    itemDtos
            );
            responseDto.setFullName(order.getFullName());
            responseDto.setPhoneNumber(order.getPhoneNumber());
            responseDto.setAddressLine1(order.getAddressLine1());
            responseDto.setAddressLine2(order.getAddressLine2());
            responseDto.setCity(order.getCity());
            responseDto.setState(order.getState());
            responseDto.setPincode(order.getPincode());

            return ResponseEntity.ok(responseDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/items/{orderItemId}/return")
    @Transactional
    public ResponseEntity<?> requestReturn(@PathVariable String orderId,
                                          @PathVariable Long orderItemId,
                                          Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

            if (!order.getUser().getUserId().equals(user.getUserId())) {
                return ResponseEntity.status(403).body(new ApiResponse(false, "Access denied. You can only return items from your own orders."));
            }

            OrderItem item = orderItemRepository.findById(orderItemId)
                    .orElseThrow(() -> new IllegalArgumentException("Order item not found with ID: " + orderItemId));

            if (!item.getOrder().getOrderId().equals(order.getOrderId())) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Order item does not belong to this order."));
            }

            if (!isWithinReturnPeriod(item, order)) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Return period has expired. Returns are available only within 10 days of delivery."));
            }

            if (!"NONE".equalsIgnoreCase(item.getReturnStatus())) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Return has already been requested for this product."));
            }

            item.setReturnStatus("RETURN_REQUESTED");
            item.setReturnRequestedAt(LocalDateTime.now());
            orderItemRepository.save(item);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("returnStatus", "RETURN_REQUESTED");
            response.put("message", "Return requested successfully. Your refund will be processed within 1–2 days.");
            return ResponseEntity.ok(response);
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
    public ResponseEntity<?> checkout(@RequestBody(required = false) Map<String, String> addressData, Authentication authentication) {
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
            LocalDateTime now = LocalDateTime.now();
            Order order = new Order(orderId, user, grandTotal, OrderStatus.SUCCESS, now, now);

            if (addressData != null) {
                order.setFullName(addressData.get("fullName"));
                order.setPhoneNumber(addressData.get("phoneNumber"));
                order.setAddressLine1(addressData.get("addressLine1"));
                order.setAddressLine2(addressData.get("addressLine2"));
                order.setCity(addressData.get("city"));
                order.setState(addressData.get("state"));
                order.setPincode(addressData.get("pincode"));
            }

            Order savedOrder = orderRepository.save(order);

            for (CartItem item : cartItems) {
                BigDecimal pricePerUnit = item.getProduct().getPrice();
                BigDecimal itemTotalPrice = pricePerUnit.multiply(BigDecimal.valueOf(item.getQuantity()));

                OrderItem orderItem = new OrderItem(savedOrder, item.getProduct(), item.getQuantity(), pricePerUnit, itemTotalPrice);
                orderItem.setDeliveryDate(now); // Set actual delivery timestamp on checkout delivery
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
