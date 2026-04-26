package com.sgnexasoft.controller;

import com.sgnexasoft.repository.UserRepository;
import com.sgnexasoft.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;
    private final UserRepository userRepository;

    private Long getCurrentUserId(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow().getId();
    }

    @PostMapping
    public ResponseEntity<?> submit(@AuthenticationPrincipal UserDetails ud,
                                     @RequestParam Long projectId,
                                     @RequestParam(required = false) String description,
                                     @RequestParam(required = false) MultipartFile file) throws Exception {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(submissionService.submit(userId, projectId, description, file));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getSubmissions(@PathVariable Long projectId) {
        return ResponseEntity.ok(submissionService.getProjectSubmissions(projectId));
    }

    @PutMapping("/{submissionId}/review")
    public ResponseEntity<?> review(@AuthenticationPrincipal UserDetails ud,
                                     @PathVariable Long submissionId,
                                     @RequestParam String status,
                                     @RequestParam(required = false) String feedback) {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(submissionService.reviewSubmission(submissionId, userId, status, feedback));
    }
}
