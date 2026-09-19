package com.toyland.ecommerce.service;

import com.toyland.ecommerce.dto.AuthResponse;
import com.toyland.ecommerce.dto.LoginRequest;
import com.toyland.ecommerce.dto.RegisterRequest;
import com.toyland.ecommerce.model.JwtToken;
import com.toyland.ecommerce.model.Role;
import com.toyland.ecommerce.model.User;
import com.toyland.ecommerce.repository.JwtTokenRepository;
import com.toyland.ecommerce.repository.UserRepository;
import com.toyland.ecommerce.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenRepository jwtTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository,
                       JwtTokenRepository jwtTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.jwtTokenRepository = jwtTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Transactional
    public AuthResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Error: Email address is already in use!");
        }

        String userName = request.getName().trim();
        // Ensure user_name is unique
        if (userRepository.existsByUserName(userName)) {
            userName = userName + "_" + System.currentTimeMillis() % 10000;
        }

        // Create new user entity
        User user = new User();
        user.setUserName(userName);
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CUSTOMER);
        user.setCreatedAt(LocalDate.now());
        user.setUpdatedAt(LocalDate.now());

        User savedUser = userRepository.save(user);

        // Generate JWT Token
        String tokenStr = jwtUtils.generateJwtToken(savedUser.getEmail());

        // Store JWT Token in `jwt_tokens` table
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

        // Generate JWT Token
        String tokenStr = jwtUtils.generateJwtToken(user.getEmail());

        // Store / Update JWT Token in `jwt_tokens` table
        saveOrUpdateJwtToken(user, tokenStr);

        return new AuthResponse(tokenStr, user.getUserId(), user.getUserName(), user.getEmail(), user.getRole());
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
