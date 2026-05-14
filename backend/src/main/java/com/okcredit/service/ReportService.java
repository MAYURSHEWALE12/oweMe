package com.okcredit.service;

import com.okcredit.dto.CustomerDto;
import com.okcredit.dto.TransactionDto;
import com.okcredit.entity.Customer;
import com.okcredit.entity.Shop;
import com.okcredit.entity.Transaction;
import com.okcredit.exception.ResourceNotFoundException;
import com.okcredit.repository.CustomerRepository;
import com.okcredit.repository.ShopRepository;
import com.okcredit.repository.TransactionRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final CustomerRepository customerRepository;
    private final ShopRepository shopRepository;

    public ReportService(TransactionRepository transactionRepository, CustomerRepository customerRepository, ShopRepository shopRepository) {
        this.transactionRepository = transactionRepository;
        this.customerRepository = customerRepository;
        this.shopRepository = shopRepository;
    }

    public byte[] generateMonthlyReportExcel(Long shopId, int month, int year) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found"));

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Transaction> transactions = transactionRepository
                .getTransactionsByDateRange(shopId, startDateTime, endDateTime);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Monthly Report - " + startDate.format(DateTimeFormatter.ofPattern("MMMM yyyy")));

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setFont(createBoldFont(workbook, IndexedColors.WHITE));

            String[] headers = {"Date", "Customer", "Type", "Amount", "Balance After", "Description"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            BigDecimal totalCredit = BigDecimal.ZERO;
            BigDecimal totalPayment = BigDecimal.ZERO;

            for (Transaction t : transactions) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(t.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                row.createCell(1).setCellValue(t.getCustomer().getName());
                row.createCell(2).setCellValue(t.getType().name());
                row.createCell(3).setCellValue(t.getAmount().doubleValue());
                row.createCell(4).setCellValue(t.getBalanceAfter().doubleValue());
                row.createCell(5).setCellValue(t.getDescription() != null ? t.getDescription() : "");

                if (t.getType() == Transaction.TransactionType.CREDIT_GIVEN) {
                    totalCredit = totalCredit.add(t.getAmount());
                } else {
                    totalPayment = totalPayment.add(t.getAmount());
                }
            }

            Row summaryRow = sheet.createRow(rowNum + 1);
            summaryRow.createCell(0).setCellValue("Total Credit Given:");
            summaryRow.createCell(1).setCellValue(totalCredit.doubleValue());

            Row summaryRow2 = sheet.createRow(rowNum + 2);
            summaryRow2.createCell(0).setCellValue("Total Payment Received:");
            summaryRow2.createCell(1).setCellValue(totalPayment.doubleValue());

            Row summaryRow3 = sheet.createRow(rowNum + 3);
            summaryRow3.createCell(0).setCellValue("Net Outstanding:");
            summaryRow3.createCell(1).setCellValue(totalCredit.subtract(totalPayment).doubleValue());

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate report", e);
        }
    }

    public byte[] generateCustomerStatement(Long customerId, Long shopId) {
        Customer customer = customerRepository.findByIdAndShopId(customerId, shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        List<Transaction> transactions = transactionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createCellStyle().getIndex() > -1 ?
                    workbook.createSheet("Statement - " + customer.getName()) :
                    workbook.createSheet("Statement");

            sheet = workbook.getSheetAt(0);
            workbook.removeSheetAt(0);
            sheet = workbook.createSheet("Statement - " + customer.getName());

            Row infoRow = sheet.createRow(0);
            infoRow.createCell(0).setCellValue("Customer Statement");
            Row nameRow = sheet.createRow(1);
            nameRow.createCell(0).setCellValue("Name: " + customer.getName());
            Row phoneRow = sheet.createRow(2);
            phoneRow.createCell(0).setCellValue("Phone: " + (customer.getPhone() != null ? customer.getPhone() : "N/A"));
            Row balanceRow = sheet.createRow(3);
            balanceRow.createCell(0).setCellValue("Current Balance: " + customer.getRunningBalance().toString());

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setFont(createBoldFont(workbook, IndexedColors.WHITE));

            String[] headers = {"Date", "Type", "Amount", "Balance After", "Description"};
            Row headerRow = sheet.createRow(5);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 6;
            for (Transaction t : transactions) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(t.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                row.createCell(1).setCellValue(t.getType().name());
                row.createCell(2).setCellValue(t.getAmount().doubleValue());
                row.createCell(3).setCellValue(t.getBalanceAfter().doubleValue());
                row.createCell(4).setCellValue(t.getDescription() != null ? t.getDescription() : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate customer statement", e);
        }
    }

    private Font createBoldFont(Workbook workbook, IndexedColors color) {
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(color.getIndex());
        return font;
    }
}