package com.sgnexasoft.service;

import com.sgnexasoft.exception.*;
import com.sgnexasoft.model.*;
import com.sgnexasoft.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public Submission submit(Long studentId, Long projectId, String description, MultipartFile file) throws IOException {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.getAssignedStudent().getId().equals(studentId)) {
            throw new BadRequestException("You are not assigned to this project");
        }

        String fileUrl = null;
        String fileName = null;

        if (file != null && !file.isEmpty()) {
            Files.createDirectories(Paths.get(uploadDir + "submissions/"));
            fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir + "submissions/" + fileName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            fileUrl = "/uploads/submissions/" + fileName;
        }

        Submission submission = Submission.builder()
                .student(student).project(project)
                .description(description).fileUrl(fileUrl).fileName(fileName)
                .status(Submission.Status.SUBMITTED)
                .build();

        project.setStatus(Project.Status.UNDER_REVIEW);
        projectRepository.save(project);

        notificationService.create(project.getClient().getId(), "Work Submitted",
                student.getName() + " submitted work for: " + project.getTitle(),
                "SUBMISSION", "/projects/" + projectId);

        return submissionRepository.save(submission);
    }

    public Submission reviewSubmission(Long submissionId, Long clientId, String status, String feedback) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        if (!submission.getProject().getClient().getId().equals(clientId)) {
            throw new BadRequestException("Not authorized");
        }

        submission.setStatus(Submission.Status.valueOf(status));
        submission.setClientFeedback(feedback);
        submission.setReviewedAt(java.time.LocalDateTime.now());

        notificationService.create(submission.getStudent().getId(), "Submission Reviewed",
                "Your submission for " + submission.getProject().getTitle() + " was " + status.toLowerCase(),
                "SUBMISSION", "/projects/" + submission.getProject().getId());

        return submissionRepository.save(submission);
    }

    public List<Submission> getProjectSubmissions(Long projectId) {
        return submissionRepository.findByProjectIdOrderBySubmittedAtDesc(projectId);
    }
}
