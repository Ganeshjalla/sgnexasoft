package com.sgnexasoft.controller;

import com.sgnexasoft.repository.UserRepository;
import com.sgnexasoft.service.ProjectService;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;

    private Long getCurrentUserId(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow().getId();
    }

    @GetMapping
    public ResponseEntity<?> getOpenProjects(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(projectService.searchProjects(search));
        }
        return ResponseEntity.ok(projectService.getOpenProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getById(id));
    }

    @PostMapping
    public ResponseEntity<?> createProject(@AuthenticationPrincipal UserDetails ud,
                                            @RequestBody CreateProjectRequest req) {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(projectService.createProject(userId, req.title, req.description,
                req.budget, req.deadline, req.category, req.tags, req.skills));
    }

    @GetMapping("/my/client")
    public ResponseEntity<?> getMyClientProjects(@AuthenticationPrincipal UserDetails ud) {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(projectService.getClientProjects(userId));
    }

    @GetMapping("/my/student")
    public ResponseEntity<?> getMyStudentProjects(@AuthenticationPrincipal UserDetails ud) {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(projectService.getStudentProjects(userId));
    }

    @PostMapping("/{projectId}/assign/{bidId}")
    public ResponseEntity<?> assignStudent(@AuthenticationPrincipal UserDetails ud,
                                            @PathVariable Long projectId,
                                            @PathVariable Long bidId) {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(projectService.assignStudent(projectId, bidId, userId));
    }

    @PostMapping("/{projectId}/complete")
    public ResponseEntity<?> completeProject(@AuthenticationPrincipal UserDetails ud,
                                              @PathVariable Long projectId) {
        Long userId = getCurrentUserId(ud);
        return ResponseEntity.ok(projectService.completeProject(projectId, userId));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(projectService.getStats());
    }

    @Data static class CreateProjectRequest {
        @NotBlank String title;
        @NotBlank String description;
        @NotNull Double budget;
        @NotNull LocalDateTime deadline;
        String category, tags, skills;
    }
}
