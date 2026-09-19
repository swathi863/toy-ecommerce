package com.toyland.ecommerce.dto;

import java.math.BigDecimal;

public class BusinessSummaryDto {
    private BigDecimal dailyBusiness;
    private BigDecimal monthlyBusiness;
    private BigDecimal yearlyBusiness;
    private BigDecimal overallBusiness;
    private long totalUsers;
    private long totalProducts;
    private long totalOrders;

    public BusinessSummaryDto() {
    }

    public BusinessSummaryDto(BigDecimal dailyBusiness, BigDecimal monthlyBusiness, BigDecimal yearlyBusiness, BigDecimal overallBusiness, long totalUsers, long totalProducts, long totalOrders) {
        this.dailyBusiness = dailyBusiness;
        this.monthlyBusiness = monthlyBusiness;
        this.yearlyBusiness = yearlyBusiness;
        this.overallBusiness = overallBusiness;
        this.totalUsers = totalUsers;
        this.totalProducts = totalProducts;
        this.totalOrders = totalOrders;
    }

    public BigDecimal getDailyBusiness() {
        return dailyBusiness;
    }

    public void setDailyBusiness(BigDecimal dailyBusiness) {
        this.dailyBusiness = dailyBusiness;
    }

    public BigDecimal getMonthlyBusiness() {
        return monthlyBusiness;
    }

    public void setMonthlyBusiness(BigDecimal monthlyBusiness) {
        this.monthlyBusiness = monthlyBusiness;
    }

    public BigDecimal getYearlyBusiness() {
        return yearlyBusiness;
    }

    public void setYearlyBusiness(BigDecimal yearlyBusiness) {
        this.yearlyBusiness = yearlyBusiness;
    }

    public BigDecimal getOverallBusiness() {
        return overallBusiness;
    }

    public void setOverallBusiness(BigDecimal overallBusiness) {
        this.overallBusiness = overallBusiness;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }
}
