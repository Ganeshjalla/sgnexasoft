package com.sgnexasoft.dto;

import com.sgnexasoft.model.*;
import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

// ─── AUTH ────────────────────────────────────────────────────────────────────

@Data @NoArgsConstructor @AllArgsConstructor
class RegisterRequest {
    @NotBlank public String name;
    @Email @NotBlank public String email;
    @NotBlank @Size(min = 6) public String password;
    @NotNull public User.Role role;
}

@Data @NoArgsConstructor @AllArgsConstructor
class LoginRequest {
    @Email @NotBlank public String email;
    @NotBlank public String password;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class AuthResponse {
    public String token;
    public String email;
    public String name;
    public String role;
    public Long userId;
}

// ─── USER ────────────────────────────────────────────────────────────────────

@Data @NoArgsConstructor @AllArgsConstructor
class UpdateProfileRequest {
    public String name;
    public String phone;
    public String bio;
    public String skills;
    public String portfolioUrl;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class UserResponse {
    public Long id;
    public String name;
    public String email;
    public String role;
    public String phone;
    public String bio;
    public String avatarUrl;
    public String resumeUrl;
    public String skills;
    public String portfolioUrl;
    public Double walletBalance;
    public Double rating;
    public Integer totalRatings;
    public LocalDateTime createdAt;
}

// ─── PROJECT ─────────────────────────────────────────────────────────────────

@Data @NoArgsConstructor @AllArgsConstructor
class CreateProjectRequest {
    @NotBlank public String title;
    @NotBlank public String description;
    @NotNull @Min(1) public Double budget;
    @NotNull public LocalDateTime deadline;
    public String category;
    public String tags;
    public String skills;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class ProjectResponse {
    public Long id;
    public String title;
    public String description;
    public Double budget;
    public LocalDateTime deadline;
    public String status;
    public String category;
    public String tags;
    public String skills;
    public UserResponse client;
    public UserResponse assignedStudent;
    public Long bidCount;
    public LocalDateTime createdAt;
}

// ─── BID ─────────────────────────────────────────────────────────────────────

@Data @NoArgsConstructor @AllArgsConstructor
class CreateBidRequest {
    @NotNull public Long projectId;
    @NotBlank public String proposal;
    @NotNull @Min(1) public Double bidAmount;
    public Integer deliveryDays;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class BidResponse {
    public Long id;
    public UserResponse student;
    public Long projectId;
    public String projectTitle;
    public String proposal;
    public Double bidAmount;
    public Integer deliveryDays;
    public String status;
    public LocalDateTime createdAt;
}

// ─── CONTRACT ─────────────────────────────────────────────────────────────────

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class ContractResponse {
    public Long id;
    public UserResponse client;
    public UserResponse student;
    public ProjectResponse project;
    public Double agreedAmount;
    public LocalDateTime startDate;
    public LocalDateTime endDate;
    public String status;
    public LocalDateTime createdAt;
}

// ─── PAYMENT ─────────────────────────────────────────────────────────────────

@Data @NoArgsConstructor @AllArgsConstructor
class InitiatePaymentRequest {
    @NotNull public Long projectId;
    @NotNull public Double amount;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class PaymentResponse {
    public Long id;
    public Double amount;
    public String status;
    public String type;
    public String transactionId;
    public Long projectId;
    public String projectTitle;
    public LocalDateTime createdAt;
}

// ─── SUBMISSION ───────────────────────────────────────────────────────────────

@Data @NoArgsConstructor @AllArgsConstructor
class SubmissionRequest {
    @NotNull public Long projectId;
    public String description;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class SubmissionResponse {
    public Long id;
    public Long projectId;
    public String projectTitle;
    public UserResponse student;
    public String description;
    public String fileUrl;
    public String fileName;
    public String status;
    public String clientFeedback;
    public LocalDateTime submittedAt;
}

// ─── MESSAGE ─────────────────────────────────────────────────────────────────

@Data @NoArgsConstructor @AllArgsConstructor
class SendMessageRequest {
    @NotNull public Long receiverId;
    @NotBlank public String content;
    public Long projectId;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class MessageResponse {
    public Long id;
    public UserResponse sender;
    public UserResponse receiver;
    public String content;
    public String fileUrl;
    public Boolean isRead;
    public Long projectId;
    public LocalDateTime sentAt;
}

// ─── REVIEW ──────────────────────────────────────────────────────────────────

@Data @NoArgsConstructor @AllArgsConstructor
class CreateReviewRequest {
    @NotNull public Long revieweeId;
    @NotNull public Long projectId;
    @NotNull @Min(1) @Max(5) public Integer rating;
    public String comment;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class ReviewResponse {
    public Long id;
    public UserResponse reviewer;
    public UserResponse reviewee;
    public Long projectId;
    public Integer rating;
    public String comment;
    public LocalDateTime createdAt;
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class DashboardStats {
    public Long totalProjects;
    public Long openProjects;
    public Long completedProjects;
    public Long totalClients;
    public Long totalStudents;
    public Double totalEarnings;
    public Long unreadMessages;
    public Long unreadNotifications;
}

// ─── NOTIFICATION ─────────────────────────────────────────────────────────────

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class NotificationResponse {
    public Long id;
    public String title;
    public String message;
    public Boolean isRead;
    public String type;
    public String link;
    public LocalDateTime createdAt;
}

// ─── WEBSOCKET ────────────────────────────────────────────────────────────────

@Data @NoArgsConstructor @AllArgsConstructor
class ChatMessage {
    public Long senderId;
    public Long receiverId;
    public String content;
    public String type; // CHAT, JOIN, LEAVE
}
