package com.okcredit.service;

import com.okcredit.entity.User;
import com.okcredit.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private final Map<String, ResetData> resetCodes = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public PasswordResetService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public void sendResetCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email"));

        String code = String.format("%06d", random.nextInt(1000000));
        resetCodes.put(email, new ResetData(code, LocalDateTime.now().plusMinutes(10)));

        String subject = "OweMe Password Reset Code";
        String body = "Your password reset code is: <strong>" + code + "</strong>"
                    + "<br><br>This code expires in 10 minutes."
                    + "<br><br>If you didn't request this, please ignore this email.";
        emailService.sendReport(user.getEmail(), subject, body, null, null);
    }

    public void resetPassword(String email, String code, String newPassword) {
        ResetData data = resetCodes.get(email);
        if (data == null) throw new RuntimeException("No reset code requested. Please request a new one.");
        if (data.expiresAt.isBefore(LocalDateTime.now())) {
            resetCodes.remove(email);
            throw new RuntimeException("Reset code has expired. Please request a new one.");
        }
        if (!data.code.equals(code.trim())) throw new RuntimeException("Invalid verification code.");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        resetCodes.remove(email);
    }

    private record ResetData(String code, LocalDateTime expiresAt) {}
}