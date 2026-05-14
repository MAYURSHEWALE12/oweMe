package com.okcredit.service;

import com.okcredit.dto.AuthDto;
import com.okcredit.dto.UserDto;
import com.okcredit.entity.Shop;
import com.okcredit.entity.User;
import com.okcredit.exception.BadRequestException;
import com.okcredit.repository.CustomerRepository;
import com.okcredit.repository.ShopRepository;
import com.okcredit.repository.UserRepository;
import com.okcredit.security.CustomUserDetailsService;
import com.okcredit.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    public AuthService(UserRepository userRepository, ShopRepository shopRepository, CustomerRepository customerRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider, CustomUserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.shopRepository = shopRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone already registered");
        }

        Shop shop = Shop.builder()
                .name(request.getName() + "'s Account")
                .build();
        shop = shopRepository.save(shop);

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(User.Role.SHOP_OWNER)
                .shop(shop)
                .active(true)
                .build();
        user = userRepository.save(user);
        final Long savedUserId = user.getId();

        customerRepository.findByEmail(request.getEmail()).forEach(c -> { c.setUserId(savedUserId); customerRepository.save(c); });
        customerRepository.findByPhone(request.getPhone()).forEach(c -> { c.setUserId(savedUserId); customerRepository.save(c); });

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return AuthDto.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .user(UserDto.fromEntity(user))
                .build();
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        userDetailsService.loadByEmail(request.getEmail()).getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return AuthDto.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .user(UserDto.fromEntity(user))
                .build();
    }

    public AuthDto.AuthResponse refreshToken(AuthDto.RefreshTokenRequest request) {
        if (!jwtTokenProvider.validateToken(request.getRefreshToken())) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(request.getRefreshToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return AuthDto.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .user(UserDto.fromEntity(user))
                .build();
    }
}