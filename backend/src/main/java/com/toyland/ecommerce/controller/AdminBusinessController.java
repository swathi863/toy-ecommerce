package com.toyland.ecommerce.controller;

import com.toyland.ecommerce.dto.ApiResponse;
import com.toyland.ecommerce.dto.BusinessSummaryDto;
import com.toyland.ecommerce.model.Order;
import com.toyland.ecommerce.model.OrderStatus;
import com.toyland.ecommerce.model.Role;
import com.toyland.ecommerce.model.User;
import com.toyland.ecommerce.repository.OrderRepository;
import com.toyland.ecommerce.repository.ProductRepository;
import com.toyland.ecommerce.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
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
    public ResponseEntity<?> getDailyBusiness(
            @RequestParam(value = "date", required = false) String dateStr,
            Authentication authentication) {
        try {
            verifyAdmin(authentication);
            List<Order> paidOrders = getPaidOrders();

            LocalDate selectedDate;
            if (dateStr != null && !dateStr.trim().isEmpty()) {
                try {
                    selectedDate = LocalDate.parse(dateStr.trim());
                } catch (Exception e) {
                    selectedDate = LocalDate.now();
                }
            } else {
                selectedDate = LocalDate.now();
            }

            BigDecimal totalSales = BigDecimal.ZERO;
            long ordersCount = 0;

            for (Order order : paidOrders) {
                if (order.getCreatedAt() != null && order.getCreatedAt().toLocalDate().isEqual(selectedDate)) {
                    totalSales = totalSales.add(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO);
                    ordersCount++;
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("period", "daily");
            response.put("date", selectedDate.toString());
            response.put("totalSales", totalSales);
            response.put("ordersCount", ordersCount);
            response.put("dailyBusiness", totalSales);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyBusiness(
            @RequestParam(value = "year", required = false) Integer yearParam,
            @RequestParam(value = "month", required = false) Integer monthParam,
            Authentication authentication) {
        try {
            verifyAdmin(authentication);
            List<Order> paidOrders = getPaidOrders();

            LocalDate today = LocalDate.now();
            int selectedYear = (yearParam != null && yearParam > 2000) ? yearParam : today.getYear();
            int selectedMonth = (monthParam != null && monthParam >= 1 && monthParam <= 12) ? monthParam : today.getMonthValue();

            BigDecimal totalSales = BigDecimal.ZERO;
            long ordersCount = 0;

            for (Order order : paidOrders) {
                if (order.getCreatedAt() != null) {
                    LocalDate orderDate = order.getCreatedAt().toLocalDate();
                    if (orderDate.getYear() == selectedYear && orderDate.getMonthValue() == selectedMonth) {
                        totalSales = totalSales.add(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO);
                        ordersCount++;
                    }
                }
            }

            Month monthEnum = Month.of(selectedMonth);
            String monthName = monthEnum.getDisplayName(TextStyle.FULL, Locale.ENGLISH);

            Map<String, Object> response = new HashMap<>();
            response.put("period", "monthly");
            response.put("year", selectedYear);
            response.put("month", selectedMonth);
            response.put("monthName", monthName);
            response.put("totalSales", totalSales);
            response.put("ordersCount", ordersCount);
            response.put("monthlyBusiness", totalSales);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/yearly")
    public ResponseEntity<?> getYearlyBusiness(
            @RequestParam(value = "year", required = false) Integer yearParam,
            Authentication authentication) {
        try {
            verifyAdmin(authentication);
            List<Order> paidOrders = getPaidOrders();

            int selectedYear = (yearParam != null && yearParam > 2000) ? yearParam : LocalDate.now().getYear();

            BigDecimal totalSales = BigDecimal.ZERO;
            long ordersCount = 0;

            for (Order order : paidOrders) {
                if (order.getCreatedAt() != null && order.getCreatedAt().getYear() == selectedYear) {
                    totalSales = totalSales.add(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO);
                    ordersCount++;
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("period", "yearly");
            response.put("year", selectedYear);
            response.put("totalSales", totalSales);
            response.put("ordersCount", ordersCount);
            response.put("yearlyBusiness", totalSales);
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

            BigDecimal totalSales = BigDecimal.ZERO;
            long ordersCount = 0;

            for (Order order : paidOrders) {
                totalSales = totalSales.add(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO);
                ordersCount++;
            }

            Map<String, Object> response = new HashMap<>();
            response.put("period", "overall");
            response.put("totalSales", totalSales);
            response.put("ordersCount", ordersCount);
            response.put("overallBusiness", totalSales);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(new ApiResponse(false, e.getMessage()));
        }
    }
}
