package com.toyland.ecommerce.dto;

import com.toyland.ecommerce.model.Role;
import java.time.LocalDate;

public class AdminUserDto {
    private Long userId;
    private String name;
    private String email;
    private Role role;
    private LocalDate createdAt;
    private LocalDate updatedAt;

    public AdminUserDto() {
    }

    public AdminUserDto(Long userId, String name, String email, Role role, LocalDate createdAt, LocalDate updatedAt) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDate getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDate updatedAt) {
        this.updatedAt = updatedAt;
    }
}
