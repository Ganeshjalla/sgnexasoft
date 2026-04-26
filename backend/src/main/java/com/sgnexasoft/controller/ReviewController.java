package com.sgnexasoft.controller;

import com.sgnexasoft.repository.UserRepository;
import com.sgnexasoft.service.ReviewService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    private Long getCurrentUserId(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow().getId();
    }

    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal UserDetails ud,
                                     @RequestBody ReviewRequest req) {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(reviewService.createReview(userId, req.revieweeId, req.projectId, req.rating, req.comment));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserReviews(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getUserReviews(userId));
    }

    @Data static class ReviewRequest {
        Long revieweeId, projectId;
        Integer rating;
        String comment;
    }
}
