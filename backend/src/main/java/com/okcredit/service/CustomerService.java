package com.okcredit.service;

import com.okcredit.dto.CustomerDto;
import com.okcredit.entity.Customer;
import com.okcredit.entity.Shop;
import com.okcredit.entity.User;
import com.okcredit.exception.BadRequestException;
import com.okcredit.exception.ResourceNotFoundException;
import com.okcredit.repository.CustomerRepository;
import com.okcredit.repository.ShopRepository;
import com.okcredit.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;

    public CustomerService(CustomerRepository customerRepository, ShopRepository shopRepository, UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.shopRepository = shopRepository;
        this.userRepository = userRepository;
    }

    public Page<CustomerDto> getCustomers(Long shopId, String search, Pageable pageable) {
        Page<Customer> customers;
        if (search != null && !search.isEmpty()) {
            customers = customerRepository.searchCustomers(shopId, search, pageable);
        } else {
            customers = customerRepository.findByShopIdAndActiveTrue(shopId, pageable);
        }
        return customers.map(CustomerDto::fromEntity);
    }

    public CustomerDto getCustomer(Long customerId, Long shopId) {
        Customer customer = customerRepository.findByIdAndShopId(customerId, shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return CustomerDto.fromEntity(customer);
    }

    @Transactional
    public CustomerDto createCustomer(CustomerDto dto, Long shopId, User currentUser) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found"));

        Customer customer = dto.toEntity();
        customer.setShop(shop);

        // Prevent duplicate email in same shop
        if (dto.getEmail() != null && !dto.getEmail().isEmpty()) {
            customerRepository.findByEmail(dto.getEmail()).ifPresent(existing -> {
                if (existing.getShop().getId().equals(shopId) && existing.getActive()) {
                    throw new BadRequestException("A friend with this email already exists");
                }
            });
        }

        Long linkedUserId = null;
        if (dto.getEmail() != null && !dto.getEmail().isEmpty()) {
            linkedUserId = userRepository.findByEmail(dto.getEmail()).map(User::getId).orElse(null);
        } else if (dto.getPhone() != null && !dto.getPhone().isEmpty()) {
            linkedUserId = userRepository.findByPhone(dto.getPhone()).map(User::getId).orElse(null);
        }
        customer.setUserId(linkedUserId);

        // Prevent reverse duplicate: if the friend already has us as a customer, reject
        if (linkedUserId != null && currentUser.getEmail() != null) {
            userRepository.findById(linkedUserId).ifPresent(friendUser -> {
                if (friendUser.getShop() != null) {
                    customerRepository.findByEmail(currentUser.getEmail()).ifPresent(reverse -> {
                        if (reverse.getShop().getId().equals(friendUser.getShop().getId()) && reverse.getActive()) {
                            throw new BadRequestException("Already friends with this person");
                        }
                    });
                }
            });
        }

        customer = customerRepository.save(customer);
        return CustomerDto.fromEntity(customer);
    }

    @Transactional
    public CustomerDto updateCustomer(Long customerId, CustomerDto dto, Long shopId) {
        Customer customer = customerRepository.findByIdAndShopId(customerId, shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        customer.setName(dto.getName());
        customer.setPhone(dto.getPhone());
        customer.setEmail(dto.getEmail());
        customer.setAddress(dto.getAddress());
        customer.setNotes(dto.getNotes());

        // Try to link user by email or phone
        String linkEmail = dto.getEmail() != null && !dto.getEmail().isEmpty() ? dto.getEmail() : customer.getEmail();
        String linkPhone = dto.getPhone() != null && !dto.getPhone().isEmpty() ? dto.getPhone() : customer.getPhone();
        Long linkedUserId = customer.getUserId();
        if (linkedUserId == null && linkEmail != null) {
            linkedUserId = userRepository.findByEmail(linkEmail).map(User::getId).orElse(null);
        }
        if (linkedUserId == null && linkPhone != null) {
            linkedUserId = userRepository.findByPhone(linkPhone).map(User::getId).orElse(null);
        }
        customer.setUserId(linkedUserId);

        // Update the linked user's phone
        if (customer.getUserId() != null && dto.getPhone() != null && !dto.getPhone().isEmpty()) {
            userRepository.findById(customer.getUserId()).ifPresent(u -> {
                u.setPhone(dto.getPhone());
                userRepository.save(u);
            });
        }

        customer = customerRepository.save(customer);
        return CustomerDto.fromEntity(customer);
    }

    @Transactional
    public void deleteCustomer(Long customerId, Long shopId) {
        Customer customer = customerRepository.findByIdAndShopId(customerId, shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        customer.setActive(false);
        customerRepository.save(customer);
    }
}