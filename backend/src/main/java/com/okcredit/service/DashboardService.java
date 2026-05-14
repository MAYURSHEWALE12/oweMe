package com.okcredit.service;

import com.okcredit.dto.DashboardDto;
import com.okcredit.repository.CustomerRepository;
import com.okcredit.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;

    public DashboardService(CustomerRepository customerRepository, TransactionRepository transactionRepository) {
        this.customerRepository = customerRepository;
        this.transactionRepository = transactionRepository;
    }

    public DashboardDto getDashboardStats(Long shopId) {
        Long activeCustomers = customerRepository.countActiveCustomers(shopId);
        BigDecimal totalReceivable = customerRepository.getTotalReceivable(shopId);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).with(LocalTime.MIN);
        LocalDateTime startOfWeek = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).with(LocalTime.MIN);

        BigDecimal thisMonthCredit = transactionRepository.getTotalCreditGiven(shopId, startOfMonth, now);
        BigDecimal thisMonthPayment = transactionRepository.getTotalPaymentReceived(shopId, startOfMonth, now);
        BigDecimal thisWeekCredit = transactionRepository.getTotalCreditGiven(shopId, startOfWeek, now);
        BigDecimal thisWeekPayment = transactionRepository.getTotalPaymentReceived(shopId, startOfWeek, now);

        BigDecimal totalCreditAllTime = transactionRepository.getTotalCreditGivenAllTime(shopId);
        BigDecimal totalPaymentAllTime = transactionRepository.getTotalPaymentReceivedAllTime(shopId);

        DashboardDto.ChartData weeklyData = getWeeklyChartData(shopId, now);
        DashboardDto.ChartData monthlyData = getMonthlyChartData(shopId, now);

        return DashboardDto.builder()
                .activeCustomers(activeCustomers)
                .totalReceivable(totalReceivable)
                .totalCreditGiven(totalCreditAllTime)
                .totalPaymentReceived(totalPaymentAllTime)
                .thisMonthCredit(thisMonthCredit)
                .thisMonthPayment(thisMonthPayment)
                .thisWeekCredit(thisWeekCredit)
                .thisWeekPayment(thisWeekPayment)
                .weeklyChart(weeklyData)
                .monthlyChart(monthlyData)
                .build();
    }

    private DashboardDto.ChartData getWeeklyChartData(Long shopId, LocalDateTime now) {
        Map<String, BigDecimal> creditData = new LinkedHashMap<>();
        Map<String, BigDecimal> paymentData = new LinkedHashMap<>();

        LocalDate startOfWeek = now.toLocalDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        for (int i = 0; i < 7; i++) {
            LocalDate day = startOfWeek.plusDays(i);
            String label = day.getDayOfWeek().name().substring(0, 3);

            LocalDateTime dayStart = day.atStartOfDay();
            LocalDateTime dayEnd = day.atTime(LocalTime.MAX);

            BigDecimal credit = transactionRepository.getTotalCreditGiven(shopId, dayStart, dayEnd);
            BigDecimal payment = transactionRepository.getTotalPaymentReceived(shopId, dayStart, dayEnd);

            creditData.put(label, credit);
            paymentData.put(label, payment);
        }

        return new DashboardDto.ChartData(creditData, paymentData);
    }

    private DashboardDto.ChartData getMonthlyChartData(Long shopId, LocalDateTime now) {
        Map<String, BigDecimal> creditData = new LinkedHashMap<>();
        Map<String, BigDecimal> paymentData = new LinkedHashMap<>();

        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        int currentMonth = now.getMonthValue();

        for (int i = 0; i < 12; i++) {
            int monthIndex = ((currentMonth - 1 - 11 + i) % 12 + 12) % 12;
            String label = months[monthIndex];

            int year = now.getYear() - (monthIndex >= currentMonth ? 1 : 0);
            LocalDate firstOfMonth = LocalDate.of(year, monthIndex + 1, 1);
            int daysInMonth = firstOfMonth.lengthOfMonth();
            LocalDateTime monthStart = firstOfMonth.atStartOfDay();
            LocalDateTime monthEnd = firstOfMonth.withDayOfMonth(daysInMonth).atTime(LocalTime.MAX);

            BigDecimal credit = transactionRepository.getTotalCreditGiven(shopId, monthStart, monthEnd);
            BigDecimal payment = transactionRepository.getTotalPaymentReceived(shopId, monthStart, monthEnd);

            creditData.put(label, credit);
            paymentData.put(label, payment);
        }

        return new DashboardDto.ChartData(creditData, paymentData);
    }
}