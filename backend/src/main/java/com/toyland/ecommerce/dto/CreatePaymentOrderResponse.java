package com.toyland.ecommerce.dto;

public class CreatePaymentOrderResponse {

    private boolean success;
    private String razorpayOrderId;
    private long amount; // in paise
    private String currency = "INR";
    private String keyId;
    private Double subtotal;
    private Double shippingFee;
    private Double grandTotal;
    private String message;

    public CreatePaymentOrderResponse() {
    }

    public CreatePaymentOrderResponse(boolean success, String razorpayOrderId, long amount, String currency, String keyId, Double subtotal, Double shippingFee, Double grandTotal, String message) {
        this.success = success;
        this.razorpayOrderId = razorpayOrderId;
        this.amount = amount;
        this.currency = currency;
        this.keyId = keyId;
        this.subtotal = subtotal;
        this.shippingFee = shippingFee;
        this.grandTotal = grandTotal;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public long getAmount() {
        return amount;
    }

    public void setAmount(long amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getKeyId() {
        return keyId;
    }

    public void setKeyId(String keyId) {
        this.keyId = keyId;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Double getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(Double shippingFee) {
        this.shippingFee = shippingFee;
    }

    public Double getGrandTotal() {
        return grandTotal;
    }

    public void setGrandTotal(Double grandTotal) {
        this.grandTotal = grandTotal;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
