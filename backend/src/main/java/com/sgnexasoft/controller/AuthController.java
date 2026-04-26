package com.sgnexasoft.controller;

import com.sgnexasoft.model.User;
import com.sgnexasoft.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req.name, req.email, req.password, req.role));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req.email, req.password));
    }

    @Data
    static class RegisterRequest {
        @NotBlank String name;
        @Email @NotBlank String email;
        @NotBlank @Size(min = 6) String password;
        @NotNull User.Role role;
    }

    @Data
    static class LoginRequest {
        @Email @NotBlank String email;
        @NotBlank String password;
    }
}
