package com.sgnexasoft.controller;

import com.sgnexasoft.model.User;
import com.sgnexasoft.repository.UserRepository;
import com.sgnexasoft.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    private Long getCurrentUserId(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow().getId();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(userService.getByEmail(ud.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetails ud,
                                            @RequestBody UpdateProfileRequest req) {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(userService.updateProfile(userId, req.name, req.phone, req.bio, req.skills, req.portfolioUrl));
    }

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(@AuthenticationPrincipal UserDetails ud,
                                           @RequestParam("file") MultipartFile file) throws Exception {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(userService.uploadAvatar(userId, file));
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserDetails ud,
                                             @RequestBody ChangePasswordRequest req) {
        Long userId = getCurrentUserId(ud);
        userService.changePassword(userId, req.oldPassword, req.newPassword);
        return ResponseEntity.ok("Password updated");
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal UserDetails ud) {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(userService.getDashboardStats(userId));
    }

    @GetMapping("/students")
    public ResponseEntity<?> getStudents() {
        return ResponseEntity.ok(userService.getAllStudents());
    }

    @GetMapping("/clients")
    public ResponseEntity<?> getClients() {
        return ResponseEntity.ok(userService.getAllClients());
    }

    @Data static class UpdateProfileRequest {
        String name, phone, bio, skills, portfolioUrl;
    }
    @Data static class ChangePasswordRequest {
        String oldPassword, newPassword;
    }
}
