package com.toyland.ecommerce.controller;

import com.toyland.ecommerce.dto.ApiResponse;
import com.toyland.ecommerce.dto.BusinessSummaryDto;
import com.toyland.ecommerce.model.OrderStatus;
import com.toyland.ecommerce.model.Order;
import com.toyland.ecommerce.model.Role;
import com.toyland.ecommerce.model.User;
import com.toyland.ecommerce.repository.OrderRepository;
import com.toyland.ecommerce.repository.ProductRepository;
import com.toyland.ecommerce.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/business")
public class AdminBusinessController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public AdminBusinessController(OrderRepository orderRepository,
                                   UserRepository userRepository,
                                   ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
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

    private List<Order> getPaidOrders() {
        return orderRepository.findAll().stream()
                .filter(order -> order.getStatus() != null && order.getStatus() != OrderStatus.FAILED)
                .collect(Collectors.toList());
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getBusinessSummary(Authentication authentication) {
        try {
            verifyAdmin(authentication);
            List<Order> paidOrders = getPaidOrders();
            LocalDate today = LocalDate.now();

            BigDecimal daily = BigDecimal.ZERO;
            BigDecimal monthly = BigDecimal.ZERO;
            BigDecimal yearly = BigDecimal.ZERO;
            BigDecimal overall = BigDecimal.ZERO;

            for (Order order : paidOrders) {
                BigDecimal amount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
                overall = overall.add(amount);

                if (order.getCreatedAt() != null) {
                    LocalDate orderDate = order.getCreatedAt().toLocalDate();
                    if (orderDate.isEqual(today)) {
                        daily = daily.add(amount);
                    }
                    if (orderDate.getYear() == today.getYear() && orderDate.getMonth() == today.getMonth()) {
                        monthly = monthly.add(amount);
                    }
                    if (orderDate.getYear() == today.getYear()) {
                        yearly = yearly.add(amount);
                    }
                }
            }

            long totalUsers = userRepository.count();
            long totalProducts = productRepository.count();
            long totalOrders = orderRepository.count();

            BusinessSummaryDto summary = new BusinessSummaryDto(
                    daily, monthly, yearly, overall,
                    totalUsers, totalProducts, totalOrders
            );

            return ResponseEntity.ok(summary);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/daily")
    public ResponseEntity<?> getDailyBusiness(Authentication authentication) {
        try {
            verifyAdmin(authentication);
            List<Order> paidOrders = getPaidOrders();
            LocalDate today = LocalDate.now();

            BigDecimal daily = BigDecimal.ZERO;
            for (Order order : paidOrders) {
                if (order.getCreatedAt() != null && order.getCreatedAt().toLocalDate().isEqual(today)) {
                    daily = daily.add(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("dailyBusiness", daily);
            response.put("date", today.toString());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyBusiness(Authentication authentication) {
        try {
            verifyAdmin(authentication);
            List<Order> paidOrders = getPaidOrders();
            LocalDate today = LocalDate.now();

            BigDecimal monthly = BigDecimal.ZERO;
            for (Order order : paidOrders) {
                if (order.getCreatedAt() != null) {
                    LocalDate orderDate = order.getCreatedAt().toLocalDate();
                    if (orderDate.getYear() == today.getYear() && orderDate.getMonth() == today.getMonth()) {
                        monthly = monthly.add(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO);
                    }
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("monthlyBusiness", monthly);
            response.put("month", today.getMonth().toString() + " " + today.getYear());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/yearly")
    public ResponseEntity<?> getYearlyBusiness(Authentication authentication) {
        try {
            verifyAdmin(authentication);
            List<Order> paidOrders = getPaidOrders();
            LocalDate today = LocalDate.now();

            BigDecimal yearly = BigDecimal.ZERO;
            for (Order order : paidOrders) {
                if (order.getCreatedAt() != null && order.getCreatedAt().getYear() == today.getYear()) {
                    yearly = yearly.add(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("yearlyBusiness", yearly);
            response.put("year", today.getYear());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/overall")
    public ResponseEntity<?> getOverallBusiness(Authentication authentication) {
        try {
            verifyAdmin(authentication);
            List<Order> paidOrders = getPaidOrders();

            BigDecimal overall = BigDecimal.ZERO;
            for (Order order : paidOrders) {
                overall = overall.add(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("overallBusiness", overall);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(new ApiResponse(false, e.getMessage()));
        }
    }
}
