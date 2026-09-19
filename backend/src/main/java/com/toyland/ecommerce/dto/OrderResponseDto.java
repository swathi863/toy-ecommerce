package com.toyland.ecommerce.dto;

import com.toyland.ecommerce.model.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponseDto {
    private String orderId;
    private BigDecimal totalAmount;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private OrderStatus status;
    private String paymentStatus;
    private LocalDateTime createdAt;
    private List<OrderItemResponseDto> items;

    public OrderResponseDto() {
    }

    public OrderResponseDto(String orderId, BigDecimal totalAmount, BigDecimal subtotal, BigDecimal shippingFee, OrderStatus status, String paymentStatus, LocalDateTime createdAt, List<OrderItemResponseDto> items) {
        this.orderId = orderId;
        this.totalAmount = totalAmount;
        this.subtotal = subtotal;
        this.shippingFee = shippingFee;
        this.status = status;
        this.paymentStatus = paymentStatus;
        this.createdAt = createdAt;
        this.items = items;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(BigDecimal shippingFee) {
        this.shippingFee = shippingFee;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<OrderItemResponseDto> getItems() {
        return items;
    }

    public void setItems(List<OrderItemResponseDto> items) {
        this.items = items;
    }
}
