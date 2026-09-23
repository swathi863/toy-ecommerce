package com.toyland.ecommerce.service;

import com.toyland.ecommerce.dto.ApiResponse;
import com.toyland.ecommerce.dto.AuthResponse;
import com.toyland.ecommerce.dto.LoginRequest;
import com.toyland.ecommerce.dto.RegisterRequest;
import com.toyland.ecommerce.dto.ResetPasswordRequest;
import com.toyland.ecommerce.model.JwtToken;
import com.toyland.ecommerce.model.PasswordResetToken;
import com.toyland.ecommerce.model.Role;
import com.toyland.ecommerce.model.User;
import com.toyland.ecommerce.repository.JwtTokenRepository;
import com.toyland.ecommerce.repository.PasswordResetTokenRepository;
import com.toyland.ecommerce.repository.UserRepository;
import com.toyland.ecommerce.security.JwtUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private final UserRepository userRepository;
    private final JwtTokenRepository jwtTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       JwtTokenRepository jwtTokenRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.jwtTokenRepository = jwtTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Error: Email address is already in use!");
        }

        String userName = request.getName().trim();
        if (userRepository.existsByUserName(userName)) {
            userName = userName + "_" + System.currentTimeMillis() % 10000;
        }

        User user = new User();
        user.setUserName(userName);
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CUSTOMER);
        user.setCreatedAt(LocalDate.now());
        user.setUpdatedAt(LocalDate.now());

        User savedUser = userRepository.save(user);

        String tokenStr = jwtUtils.generateJwtToken(savedUser.getEmail());
        saveOrUpdateJwtToken(savedUser, tokenStr);

        return new AuthResponse(tokenStr, savedUser.getUserId(), savedUser.getUserName(), savedUser.getEmail(), savedUser.getRole());
    }

    @Transactional
    public AuthResponse loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Error: Invalid email or password!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Error: Invalid email or password!");
        }

        String tokenStr = jwtUtils.generateJwtToken(user.getEmail());
        saveOrUpdateJwtToken(user, tokenStr);

        return new AuthResponse(tokenStr, user.getUserId(), user.getUserName() != null ? user.getUserName() : user.getEmail(), user.getEmail(), user.getRole());
    }

    @Transactional
    public void logoutUser(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            jwtTokenRepository.findByUserUserId(user.getUserId())
                    .ifPresent(jwtTokenRepository::delete);
        });
    }

    @Transactional
    public ApiResponse processForgotPassword(String email) {
        String cleanEmail = email.trim().toLowerCase();
        System.out.println(">>> 🔑 RECEIVED FORGOT PASSWORD REQUEST FOR EMAIL: " + cleanEmail);

        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> {
                    System.err.println(">>> ❌ ERROR: NO REGISTERED USER FOUND FOR EMAIL: " + cleanEmail);
                    return new IllegalArgumentException("No registered account found with email: " + cleanEmail);
                });

        String tokenStr = UUID.randomUUID().toString();


        Optional<PasswordResetToken> existingTokenOpt = passwordResetTokenRepository.findByUser(user);
        PasswordResetToken resetToken;
        if (existingTokenOpt.isPresent()) {
            resetToken = existingTokenOpt.get();
            resetToken.setToken(tokenStr);
            resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(30));
        } else {
            resetToken = new PasswordResetToken(
                    tokenStr,
                    user,
                    LocalDateTime.now().plusMinutes(30)
            );
        }
        passwordResetTokenRepository.save(resetToken);

        // Build reset link
        String resetLink = String.format("%s/reset-password?token=%s", frontendUrl, tokenStr);

        // Send email / log link
        boolean emailSent = emailService.sendPasswordResetEmail(user.getEmail(), user.getUserName(), resetLink);

        if (!emailSent) {
            return new ApiResponse(true, "Password reset link generated! (Note: MAIL_USERNAME/MAIL_PASSWORD is not configured on Render. Check Render logs for the link).");
        }

        return new ApiResponse(true, "Password reset instructions sent to " + user.getEmail());
    }


    @Transactional
    public ApiResponse processResetPassword(ResetPasswordRequest request) {
        String token = request.getToken().trim();
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset link. Please request a new one."));

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Password reset link has expired. Please request a new link.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDate.now());
        userRepository.save(user);

        // Remove used token
        passwordResetTokenRepository.delete(resetToken);

        return new ApiResponse(true, "Your password has been reset successfully! Please log in with your new password.");
    }

    public boolean validateResetToken(String token) {
        return passwordResetTokenRepository.findByToken(token)
                .map(t -> !t.isExpired())
                .orElse(false);
    }

    private void saveOrUpdateJwtToken(User user, String tokenStr) {
        Optional<JwtToken> existingTokenOpt = jwtTokenRepository.findByUserUserId(user.getUserId());
        JwtToken jwtToken;
        if (existingTokenOpt.isPresent()) {
            jwtToken = existingTokenOpt.get();
            jwtToken.setToken(tokenStr);
            jwtToken.setUpdatedAt(LocalDate.now());
        } else {
            jwtToken = new JwtToken(user, tokenStr, LocalDate.now(), LocalDate.now());
        }
        jwtTokenRepository.save(jwtToken);
    }
}
