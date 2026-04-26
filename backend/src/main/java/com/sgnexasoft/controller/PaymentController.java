package com.sgnexasoft.controller;

import com.sgnexasoft.repository.UserRepository;
import com.sgnexasoft.service.PaymentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    private Long getCurrentUserId(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow().getId();
    }

    @PostMapping("/initiate")
    public ResponseEntity<?> initiate(@AuthenticationPrincipal UserDetails ud,
                                       @RequestBody PaymentRequest req) {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(paymentService.initiatePayment(userId, req.projectId, req.amount));
    }

    @PostMapping("/{paymentId}/release")
    public ResponseEntity<?> release(@AuthenticationPrincipal UserDetails ud,
                                      @PathVariable Long paymentId) {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(paymentService.releasePayment(paymentId, userId));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyPayments(@AuthenticationPrincipal UserDetails ud) {
        Long userId = getCurrentUserId(ud);
        var user = userRepository.findByEmail(ud.getUsername()).orElseThrow();
        if (user.getRole().name().equals("CLIENT")) {
            return ResponseEntity.ok(paymentService.getClientPayments(userId));
        }
        return ResponseEntity.ok(paymentService.getStudentPayments(userId));
    }

    @Data static class PaymentRequest {
        Long projectId;
        Double amount;
    }
}
