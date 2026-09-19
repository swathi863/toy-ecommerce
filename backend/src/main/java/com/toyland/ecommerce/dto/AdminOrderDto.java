package com.toyland.ecommerce.dto;

import com.toyland.ecommerce.model.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AdminOrderDto {
    private String orderId;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private LocalDateTime createdAt;
    private BigDecimal totalAmount;
    private String paymentStatus;
    private OrderStatus status;
    private List<OrderItemResponseDto> items;

    public AdminOrderDto() {
    }

    public AdminOrderDto(String orderId, Long customerId, String customerName, String customerEmail, LocalDateTime createdAt, BigDecimal totalAmount, String paymentStatus, OrderStatus status, List<OrderItemResponseDto> items) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.createdAt = createdAt;
        this.totalAmount = totalAmount;
        this.paymentStatus = paymentStatus;
        this.status = status;
        this.items = items;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public List<OrderItemResponseDto> getItems() {
        return items;
    }

    public void setItems(List<OrderItemResponseDto> items) {
        this.items = items;
    }
}
