package com.toyland.ecommerce.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartResponseDto {

    private List<CartItemDto> items;
    private int totalItemsCount;
    private BigDecimal grandTotal;

    public CartResponseDto() {
    }

    public CartResponseDto(List<CartItemDto> items, int totalItemsCount, BigDecimal grandTotal) {
        this.items = items;
        this.totalItemsCount = totalItemsCount;
        this.grandTotal = grandTotal;
    }

    public List<CartItemDto> getItems() {
        return items;
    }

    public void setItems(List<CartItemDto> items) {
        this.items = items;
    }

    public int getTotalItemsCount() {
        return totalItemsCount;
    }

    public void setTotalItemsCount(int totalItemsCount) {
        this.totalItemsCount = totalItemsCount;
    }

    public BigDecimal getGrandTotal() {
        return grandTotal;
    }

    public void setGrandTotal(BigDecimal grandTotal) {
        this.grandTotal = grandTotal;
    }
}
