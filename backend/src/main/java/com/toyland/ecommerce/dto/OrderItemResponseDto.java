package com.toyland.ecommerce.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderItemResponseDto {
    private Long orderItemsId;
    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal pricePerUnit;
    private BigDecimal totalPrice;
    private String imageUrl;
    private String returnStatus;
    private boolean returnEligible;
    private LocalDateTime returnRequestedAt;
    private LocalDateTime deliveryDate;

    public OrderItemResponseDto() {
    }

    public OrderItemResponseDto(Long orderItemsId, Long productId, String productName, Integer quantity, BigDecimal pricePerUnit, BigDecimal totalPrice, String imageUrl) {
        this(orderItemsId, productId, productName, quantity, pricePerUnit, totalPrice, imageUrl, "NONE", false, null, null);
    }

    public OrderItemResponseDto(Long orderItemsId, Long productId, String productName, Integer quantity, BigDecimal pricePerUnit, BigDecimal totalPrice, String imageUrl, String returnStatus, boolean returnEligible, LocalDateTime returnRequestedAt, LocalDateTime deliveryDate) {
        this.orderItemsId = orderItemsId;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.pricePerUnit = pricePerUnit;
        this.totalPrice = totalPrice;
        this.imageUrl = imageUrl;
        this.returnStatus = returnStatus != null ? returnStatus : "NONE";
        this.returnEligible = returnEligible;
        this.returnRequestedAt = returnRequestedAt;
        this.deliveryDate = deliveryDate;
    }

    public Long getOrderItemsId() {
        return orderItemsId;
    }

    public void setOrderItemsId(Long orderItemsId) {
        this.orderItemsId = orderItemsId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPricePerUnit() {
        return pricePerUnit;
    }

    public void setPricePerUnit(BigDecimal pricePerUnit) {
        this.pricePerUnit = pricePerUnit;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getReturnStatus() {
        return returnStatus;
    }

    public void setReturnStatus(String returnStatus) {
        this.returnStatus = returnStatus;
    }

    public boolean isReturnEligible() {
        return returnEligible;
    }

    public void setReturnEligible(boolean returnEligible) {
        this.returnEligible = returnEligible;
    }

    public LocalDateTime getReturnRequestedAt() {
        return returnRequestedAt;
    }

    public void setReturnRequestedAt(LocalDateTime returnRequestedAt) {
        this.returnRequestedAt = returnRequestedAt;
    }

    public LocalDateTime getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDateTime deliveryDate) {
        this.deliveryDate = deliveryDate;
    }
}
