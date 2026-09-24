package com.toyland.ecommerce.dto;

import java.math.BigDecimal;
import java.util.List;

public class WishlistItemDto {
    private Long wishlistId;
    private Long productId;
    private String productName;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String imageUrl;
    private List<String> images;
    private boolean inStock;

    public WishlistItemDto() {
    }

    public WishlistItemDto(Long wishlistId, Long productId, String productName, String description, BigDecimal price, Integer stock, String imageUrl, List<String> images, boolean inStock) {
        this.wishlistId = wishlistId;
        this.productId = productId;
        this.productName = productName;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.imageUrl = imageUrl;
        this.images = images;
        this.inStock = inStock;
    }

    public Long getWishlistId() {
        return wishlistId;
    }

    public void setWishlistId(Long wishlistId) {
        this.wishlistId = wishlistId;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public boolean isInStock() {
        return inStock;
    }

    public void setInStock(boolean inStock) {
        this.inStock = inStock;
    }
}
