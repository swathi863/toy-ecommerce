package com.toyland.ecommerce.dto;

public class PaymentVerificationResponse {

    private boolean success;
    private String orderId;
    private Double totalAmount;
    private String message;

    public PaymentVerificationResponse() {
    }

    public PaymentVerificationResponse(boolean success, String orderId, Double totalAmount, String message) {
        this.success = success;
        this.orderId = orderId;
        this.totalAmount = totalAmount;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
