package com.okcredit.service;

import com.okcredit.dto.TransactionDto;
import com.okcredit.entity.Customer;
import com.okcredit.entity.Notification;
import com.okcredit.entity.Shop;
import com.okcredit.entity.Transaction;
import com.okcredit.entity.User;
import com.okcredit.exception.BadRequestException;
import com.okcredit.exception.ResourceNotFoundException;
import com.okcredit.repository.CustomerRepository;
import com.okcredit.repository.NotificationRepository;
import com.okcredit.repository.ShopRepository;
import com.okcredit.repository.TransactionRepository;
import com.okcredit.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CustomerRepository customerRepository;
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationSseService notificationSseService;

    public TransactionService(TransactionRepository transactionRepository, CustomerRepository customerRepository, ShopRepository shopRepository, UserRepository userRepository, NotificationRepository notificationRepository, NotificationSseService notificationSseService) {
        this.transactionRepository = transactionRepository;
        this.customerRepository = customerRepository;
        this.shopRepository = shopRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.notificationSseService = notificationSseService;
    }

    private Customer findCustomer(Long customerId, User user) {
        return customerRepository.findByIdAndShopId(customerId, user.getShop().getId())
                .orElseGet(() -> customerRepository.findById(customerId)
                        .filter(c -> user.getId().equals(c.getUserId()))
                        .orElseThrow(() -> new ResourceNotFoundException("Customer not found")));
    }

    public Page<TransactionDto> getCustomerTransactions(Long customerId, User user, Pageable pageable) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (!customer.getShop().getId().equals(user.getShop().getId()) &&
            !user.getId().equals(customer.getUserId())) {
            throw new BadRequestException("Unauthorized");
        }

        return transactionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable)
                .map(TransactionDto::fromEntity);
    }

    @Transactional
    public TransactionDto giveCredit(TransactionDto dto, User user) {
        Customer customer = findCustomer(dto.getCustomerId(), user);
        Shop shop = customer.getShop();

        BigDecimal newRunningBalance = customer.getRunningBalance().add(dto.getAmount());

        Transaction transaction = Transaction.builder()
                .type(Transaction.TransactionType.CREDIT_GIVEN)
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .note(dto.getNote())
                .customer(customer)
                .shop(shop)
                .createdBy(user)
                .balanceAfter(newRunningBalance)
                .build();
        transaction = transactionRepository.save(transaction);

        customer.setTotalCreditGiven(customer.getTotalCreditGiven().add(dto.getAmount()));
        customer.setRunningBalance(newRunningBalance);
        customerRepository.save(customer);

        createNotification(customer, user, "CREDIT_GIVEN", dto.getAmount());

        return TransactionDto.fromEntity(transaction);
    }

    @Transactional
    public TransactionDto receivePayment(TransactionDto dto, User user) {
        Customer customer = findCustomer(dto.getCustomerId(), user);
        Shop shop = customer.getShop();

        BigDecimal newRunningBalance = customer.getRunningBalance().subtract(dto.getAmount());

        Transaction transaction = Transaction.builder()
                .type(Transaction.TransactionType.PAYMENT_RECEIVED)
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .note(dto.getNote())
                .customer(customer)
                .shop(shop)
                .createdBy(user)
                .balanceAfter(newRunningBalance)
                .build();
        transaction = transactionRepository.save(transaction);

        customer.setTotalPaymentReceived(customer.getTotalPaymentReceived().add(dto.getAmount()));
        customer.setRunningBalance(newRunningBalance);
        customerRepository.save(customer);

        createNotification(customer, user, "PAYMENT_RECEIVED", dto.getAmount());

        return TransactionDto.fromEntity(transaction);
    }

    private void createNotification(Customer customer, User fromUser, String type, java.math.BigDecimal amount) {
        String verb = type.equals("CREDIT_GIVEN") ? "lent" : "received";
        String title = type.equals("CREDIT_GIVEN")
            ? "You lent ₹" + amount.toPlainString() + " to " + customer.getName()
            : "You received ₹" + amount.toPlainString() + " from " + customer.getName();
        String msg = "Balance: ₹" + customer.getRunningBalance().toPlainString();

        Notification selfNotif = new Notification();
        selfNotif.setUserId(fromUser.getId());
        selfNotif.setTitle(title);
        selfNotif.setMessage(msg);
        selfNotif.setType(type);
        selfNotif.setRelatedCustomerId(customer.getId());
        notificationRepository.save(selfNotif);
        notificationSseService.sendNotification(fromUser.getId(), selfNotif);

        if (customer.getUserId() != null) {
            String friendTitle = type.equals("CREDIT_GIVEN")
                ? fromUser.getName() + " lent you ₹" + amount.toPlainString()
                : fromUser.getName() + " recorded payment of ₹" + amount.toPlainString();
            Notification friendNotif = new Notification();
            friendNotif.setUserId(customer.getUserId());
            friendNotif.setTitle(friendTitle);
            friendNotif.setMessage(msg);
            friendNotif.setType(type);
            friendNotif.setRelatedCustomerId(customer.getId());
            notificationRepository.save(friendNotif);
            notificationSseService.sendNotification(customer.getUserId(), friendNotif);
        }
    }

    public Page<TransactionDto> getRecentTransactions(Long shopId, Pageable pageable) {
        return transactionRepository.findRecentTransactions(shopId, pageable)
                .map(TransactionDto::fromEntity);
    }

    @Transactional
    public TransactionDto updateTransaction(Long transactionId, TransactionDto dto, User user) {
        Transaction txn = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!txn.getShop().getId().equals(user.getShop().getId()) &&
            !user.getId().equals(txn.getCustomer().getUserId())) {
            throw new BadRequestException("Unauthorized");
        }

        Customer customer = txn.getCustomer();
        BigDecimal oldAmount = txn.getAmount();

        BigDecimal newAmount = dto.getAmount();
        BigDecimal difference = newAmount.subtract(oldAmount);

        if (txn.getType() == Transaction.TransactionType.CREDIT_GIVEN) {
            customer.setRunningBalance(customer.getRunningBalance().add(difference));
            customer.setTotalCreditGiven(customer.getTotalCreditGiven().add(difference));
        } else {
            customer.setRunningBalance(customer.getRunningBalance().subtract(difference));
            customer.setTotalPaymentReceived(customer.getTotalPaymentReceived().add(difference));
        }
        customerRepository.save(customer);

        txn.setAmount(newAmount);
        txn.setDescription(dto.getDescription());
        txn.setNote(dto.getNote());
        txn.setBalanceAfter(customer.getRunningBalance());
        txn = transactionRepository.save(txn);

        return TransactionDto.fromEntity(txn);
    }

    @Transactional
    public void deleteTransaction(Long transactionId, User user) {
        Transaction txn = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!txn.getShop().getId().equals(user.getShop().getId()) &&
            !user.getId().equals(txn.getCustomer().getUserId())) {
            throw new BadRequestException("Unauthorized");
        }

        Customer customer = txn.getCustomer();

        if (txn.getType() == Transaction.TransactionType.CREDIT_GIVEN) {
            customer.setRunningBalance(customer.getRunningBalance().subtract(txn.getAmount()));
            customer.setTotalCreditGiven(customer.getTotalCreditGiven().subtract(txn.getAmount()));
        } else {
            customer.setRunningBalance(customer.getRunningBalance().add(txn.getAmount()));
            customer.setTotalPaymentReceived(customer.getTotalPaymentReceived().subtract(txn.getAmount()));
        }
        customerRepository.save(customer);

        txn.setDeleted(true);
        transactionRepository.save(txn);
    }
}