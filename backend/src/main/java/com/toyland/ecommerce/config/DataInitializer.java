package com.toyland.ecommerce.config;

import com.toyland.ecommerce.model.Role;
import com.toyland.ecommerce.model.User;
import com.toyland.ecommerce.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@toyland.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setUserName("Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setCreatedAt(LocalDate.now());
            admin.setUpdatedAt(LocalDate.now());

            userRepository.save(admin);
            System.out.println("Default Admin Account Created: admin@toyland.com / admin123");
        }
    }
}
