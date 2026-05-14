package com.okcredit.dto;

import java.math.BigDecimal;
import java.util.Map;

public class DashboardDto {
    private Long activeCustomers;
    private BigDecimal totalReceivable;
    private BigDecimal totalCreditGiven;
    private BigDecimal totalPaymentReceived;
    private BigDecimal thisMonthCredit;
    private BigDecimal thisMonthPayment;
    private BigDecimal thisWeekCredit;
    private BigDecimal thisWeekPayment;
    private ChartData weeklyChart;
    private ChartData monthlyChart;

    public DashboardDto() {}

    public DashboardDto(Long activeCustomers, BigDecimal totalReceivable, BigDecimal totalCreditGiven, BigDecimal totalPaymentReceived, BigDecimal thisMonthCredit, BigDecimal thisMonthPayment, BigDecimal thisWeekCredit, BigDecimal thisWeekPayment, ChartData weeklyChart, ChartData monthlyChart) {
        this.activeCustomers = activeCustomers;
        this.totalReceivable = totalReceivable;
        this.totalCreditGiven = totalCreditGiven;
        this.totalPaymentReceived = totalPaymentReceived;
        this.thisMonthCredit = thisMonthCredit;
        this.thisMonthPayment = thisMonthPayment;
        this.thisWeekCredit = thisWeekCredit;
        this.thisWeekPayment = thisWeekPayment;
        this.weeklyChart = weeklyChart;
        this.monthlyChart = monthlyChart;
    }

    public Long getActiveCustomers() { return activeCustomers; }
    public void setActiveCustomers(Long activeCustomers) { this.activeCustomers = activeCustomers; }
    public BigDecimal getTotalReceivable() { return totalReceivable; }
    public void setTotalReceivable(BigDecimal totalReceivable) { this.totalReceivable = totalReceivable; }
    public BigDecimal getTotalCreditGiven() { return totalCreditGiven; }
    public void setTotalCreditGiven(BigDecimal totalCreditGiven) { this.totalCreditGiven = totalCreditGiven; }
    public BigDecimal getTotalPaymentReceived() { return totalPaymentReceived; }
    public void setTotalPaymentReceived(BigDecimal totalPaymentReceived) { this.totalPaymentReceived = totalPaymentReceived; }
    public BigDecimal getThisMonthCredit() { return thisMonthCredit; }
    public void setThisMonthCredit(BigDecimal thisMonthCredit) { this.thisMonthCredit = thisMonthCredit; }
    public BigDecimal getThisMonthPayment() { return thisMonthPayment; }
    public void setThisMonthPayment(BigDecimal thisMonthPayment) { this.thisMonthPayment = thisMonthPayment; }
    public BigDecimal getThisWeekCredit() { return thisWeekCredit; }
    public void setThisWeekCredit(BigDecimal thisWeekCredit) { this.thisWeekCredit = thisWeekCredit; }
    public BigDecimal getThisWeekPayment() { return thisWeekPayment; }
    public void setThisWeekPayment(BigDecimal thisWeekPayment) { this.thisWeekPayment = thisWeekPayment; }
    public ChartData getWeeklyChart() { return weeklyChart; }
    public void setWeeklyChart(ChartData weeklyChart) { this.weeklyChart = weeklyChart; }
    public ChartData getMonthlyChart() { return monthlyChart; }
    public void setMonthlyChart(ChartData monthlyChart) { this.monthlyChart = monthlyChart; }

    @Override
    public String toString() {
        return "DashboardDto{activeCustomers=" + activeCustomers + ", totalReceivable=" + totalReceivable + ", totalCreditGiven=" + totalCreditGiven + ", totalPaymentReceived=" + totalPaymentReceived + ", thisMonthCredit=" + thisMonthCredit + ", thisMonthPayment=" + thisMonthPayment + ", thisWeekCredit=" + thisWeekCredit + ", thisWeekPayment=" + thisWeekPayment + ", weeklyChart=" + weeklyChart + ", monthlyChart=" + monthlyChart + "}";
    }

    public static Builder builder() { return new Builder(); }

    private DashboardDto(Builder builder) {
        this.activeCustomers = builder.activeCustomers;
        this.totalReceivable = builder.totalReceivable;
        this.totalCreditGiven = builder.totalCreditGiven;
        this.totalPaymentReceived = builder.totalPaymentReceived;
        this.thisMonthCredit = builder.thisMonthCredit;
        this.thisMonthPayment = builder.thisMonthPayment;
        this.thisWeekCredit = builder.thisWeekCredit;
        this.thisWeekPayment = builder.thisWeekPayment;
        this.weeklyChart = builder.weeklyChart;
        this.monthlyChart = builder.monthlyChart;
    }

    public static class Builder {
        private Long activeCustomers;
        private BigDecimal totalReceivable;
        private BigDecimal totalCreditGiven;
        private BigDecimal totalPaymentReceived;
        private BigDecimal thisMonthCredit;
        private BigDecimal thisMonthPayment;
        private BigDecimal thisWeekCredit;
        private BigDecimal thisWeekPayment;
        private ChartData weeklyChart;
        private ChartData monthlyChart;

        public Builder activeCustomers(Long activeCustomers) { this.activeCustomers = activeCustomers; return this; }
        public Builder totalReceivable(BigDecimal totalReceivable) { this.totalReceivable = totalReceivable; return this; }
        public Builder totalCreditGiven(BigDecimal totalCreditGiven) { this.totalCreditGiven = totalCreditGiven; return this; }
        public Builder totalPaymentReceived(BigDecimal totalPaymentReceived) { this.totalPaymentReceived = totalPaymentReceived; return this; }
        public Builder thisMonthCredit(BigDecimal thisMonthCredit) { this.thisMonthCredit = thisMonthCredit; return this; }
        public Builder thisMonthPayment(BigDecimal thisMonthPayment) { this.thisMonthPayment = thisMonthPayment; return this; }
        public Builder thisWeekCredit(BigDecimal thisWeekCredit) { this.thisWeekCredit = thisWeekCredit; return this; }
        public Builder thisWeekPayment(BigDecimal thisWeekPayment) { this.thisWeekPayment = thisWeekPayment; return this; }
        public Builder weeklyChart(ChartData weeklyChart) { this.weeklyChart = weeklyChart; return this; }
        public Builder monthlyChart(ChartData monthlyChart) { this.monthlyChart = monthlyChart; return this; }

        public DashboardDto build() { return new DashboardDto(this); }
    }

    public static class ChartData {
        private Map<String, BigDecimal> creditData;
        private Map<String, BigDecimal> paymentData;

        public ChartData() {}

        public ChartData(Map<String, BigDecimal> creditData, Map<String, BigDecimal> paymentData) {
            this.creditData = creditData;
            this.paymentData = paymentData;
        }

        public Map<String, BigDecimal> getCreditData() { return creditData; }
        public void setCreditData(Map<String, BigDecimal> creditData) { this.creditData = creditData; }
        public Map<String, BigDecimal> getPaymentData() { return paymentData; }
        public void setPaymentData(Map<String, BigDecimal> paymentData) { this.paymentData = paymentData; }

        @Override
        public String toString() {
            return "ChartData{creditData=" + creditData + ", paymentData=" + paymentData + "}";
        }
    }
}
