package com.toyland.ecommerce.controller;

import com.toyland.ecommerce.dto.AdminUpdateUserRequest;
import com.toyland.ecommerce.dto.AdminUserDto;
import com.toyland.ecommerce.dto.ApiResponse;
import com.toyland.ecommerce.model.Role;
import com.toyland.ecommerce.model.User;
import com.toyland.ecommerce.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
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

    private AdminUserDto mapToDto(User user) {
        return new AdminUserDto(
                user.getUserId(),
                user.getUserName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(Authentication authentication) {
        try {
            verifyAdmin(authentication);
            List<User> users = userRepository.findAll();
            List<AdminUserDto> dtos = users.stream().map(this::mapToDto).collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId, Authentication authentication) {
        try {
            verifyAdmin(authentication);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
            return ResponseEntity.ok(mapToDto(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{userId}")
    @Transactional
    public ResponseEntity<?> updateUser(@PathVariable Long userId,
                                        @Valid @RequestBody AdminUpdateUserRequest request,
                                        Authentication authentication) {
        try {
            verifyAdmin(authentication);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

            // Check if email is already taken by another user
            if (!user.getEmail().equalsIgnoreCase(request.getEmail().trim())) {
                if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
                    throw new IllegalArgumentException("Email is already in use by another user.");
                }
            }

            user.setUserName(request.getName().trim());
            user.setEmail(request.getEmail().trim().toLowerCase());
            user.setRole(request.getRole());
            user.setUpdatedAt(LocalDate.now());

            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(mapToDto(savedUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long userId, Authentication authentication) {
        try {
            User currentAdmin = verifyAdmin(authentication);

            if (currentAdmin.getUserId().equals(userId)) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "You cannot delete your own active admin account."));
            }

            User targetUser = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

            userRepository.delete(targetUser);
            return ResponseEntity.ok(new ApiResponse(true, "User deleted successfully!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
