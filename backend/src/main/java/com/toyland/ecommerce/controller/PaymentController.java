package com.toyland.ecommerce.controller;

import com.toyland.ecommerce.dto.ApiResponse;
import com.toyland.ecommerce.dto.CreatePaymentOrderResponse;
import com.toyland.ecommerce.dto.PaymentVerificationResponse;
import com.toyland.ecommerce.dto.VerifyPaymentRequest;
import com.toyland.ecommerce.model.User;
import com.toyland.ecommerce.repository.UserRepository;
import com.toyland.ecommerce.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    public PaymentController(PaymentService paymentService, UserRepository userRepository) {
        this.paymentService = paymentService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("User is not authenticated. Please log in first.");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found."));
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createPaymentOrder(Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            CreatePaymentOrderResponse response = paymentService.createRazorpayOrder(user);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse(false, "Failed to create Razorpay order: " + e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@Valid @RequestBody VerifyPaymentRequest request, Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            PaymentVerificationResponse response = paymentService.verifyPaymentAndCreateOrder(user, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse(false, "Payment verification failed: " + e.getMessage()));
        }
    }
}
