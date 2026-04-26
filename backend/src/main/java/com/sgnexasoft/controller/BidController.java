package com.sgnexasoft.controller;

import com.sgnexasoft.repository.UserRepository;
import com.sgnexasoft.service.BidService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bids")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;
    private final UserRepository userRepository;

    private Long getCurrentUserId(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow().getId();
    }

    @PostMapping
    public ResponseEntity<?> placeBid(@AuthenticationPrincipal UserDetails ud,
                                       @RequestBody BidRequest req) {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(bidService.placeBid(userId, req.projectId, req.proposal, req.bidAmount, req.deliveryDays));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getProjectBids(@PathVariable Long projectId) {
        return ResponseEntity.ok(bidService.getBidsForProject(projectId));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyBids(@AuthenticationPrincipal UserDetails ud) {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(bidService.getStudentBids(userId));
    }

    @Data static class BidRequest {
        Long projectId;
        String proposal;
        Double bidAmount;
        Integer deliveryDays;
    }
}
