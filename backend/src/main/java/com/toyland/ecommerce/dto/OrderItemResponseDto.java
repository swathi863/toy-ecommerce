package com.toyland.ecommerce.dto;

import java.math.BigDecimal;

public class OrderItemResponseDto {
    private Long orderItemsId;
    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal pricePerUnit;
    private BigDecimal totalPrice;
    private String imageUrl;

    public OrderItemResponseDto() {
    }

    public OrderItemResponseDto(Long orderItemsId, Long productId, String productName, Integer quantity, BigDecimal pricePerUnit, BigDecimal totalPrice, String imageUrl) {
        this.orderItemsId = orderItemsId;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.pricePerUnit = pricePerUnit;
        this.totalPrice = totalPrice;
        this.imageUrl = imageUrl;
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
}
