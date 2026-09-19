package com.toyland.ecommerce.dto;

import com.toyland.ecommerce.model.OrderStatus;
import jakarta.validation.constraints.NotNull;

public class AdminUpdateOrderStatusRequest {
    @NotNull(message = "Status is required")
    private OrderStatus status;

    public AdminUpdateOrderStatusRequest() {
    }

    public AdminUpdateOrderStatusRequest(OrderStatus status) {
        this.status = status;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}
