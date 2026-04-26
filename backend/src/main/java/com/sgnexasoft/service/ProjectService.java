package com.sgnexasoft.service;

import com.sgnexasoft.exception.*;
import com.sgnexasoft.model.*;
import com.sgnexasoft.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final BidRepository bidRepository;
    private final ContractRepository contractRepository;
    private final NotificationService notificationService;

    public Project createProject(Long clientId, String title, String description,
                                  Double budget, LocalDateTime deadline, String category,
                                  String tags, String skills) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (client.getRole() != User.Role.CLIENT && client.getRole() != User.Role.ADMIN) {
            throw new BadRequestException("Only clients can post projects");
        }

        Project project = Project.builder()
                .title(title).description(description).budget(budget)
                .deadline(deadline).category(category).tags(tags)
                .skills(skills).client(client).status(Project.Status.OPEN)
                .build();

        return projectRepository.save(project);
    }

    public List<Project> getOpenProjects() {
        return projectRepository.findByStatusOrderByCreatedAtDesc(Project.Status.OPEN);
    }

    public List<Project> searchProjects(String keyword) {
        return projectRepository.searchOpenProjects(keyword.toLowerCase());
    }

    public Project getById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    public List<Project> getClientProjects(Long clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return projectRepository.findByClientOrderByCreatedAtDesc(client);
    }

    public List<Project> getStudentProjects(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return projectRepository.findByAssignedStudentOrderByCreatedAtDesc(student);
    }

    @Transactional
    public Project assignStudent(Long projectId, Long bidId, Long clientId) {
        Project project = getById(projectId);
        if (!project.getClient().getId().equals(clientId)) {
            throw new BadRequestException("Only the project owner can assign students");
        }
        if (project.getStatus() != Project.Status.OPEN) {
            throw new BadRequestException("Project is not open for assignment");
        }

        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new ResourceNotFoundException("Bid not found"));

        // Accept this bid, reject others
        List<Bid> allBids = bidRepository.findByProjectOrderByCreatedAtDesc(project);
        allBids.forEach(b -> {
            b.setStatus(b.getId().equals(bidId) ? Bid.Status.ACCEPTED : Bid.Status.REJECTED);
            bidRepository.save(b);
        });

        project.setAssignedStudent(bid.getStudent());
        project.setStatus(Project.Status.IN_PROGRESS);

        // Create contract
        Contract contract = Contract.builder()
                .client(project.getClient())
                .student(bid.getStudent())
                .project(project)
                .agreedAmount(bid.getBidAmount())
                .startDate(LocalDateTime.now())
                .endDate(project.getDeadline())
                .status(Contract.Status.ACTIVE)
                .build();
        contractRepository.save(contract);

        // Notify student
        notificationService.create(bid.getStudent().getId(), "Project Assigned!",
                "You've been selected for: " + project.getTitle(), "CONTRACT",
                "/projects/" + project.getId());

        return projectRepository.save(project);
    }

    @Transactional
    public Project completeProject(Long projectId, Long clientId) {
        Project project = getById(projectId);
        if (!project.getClient().getId().equals(clientId)) {
            throw new BadRequestException("Only the project owner can mark it complete");
        }
        project.setStatus(Project.Status.COMPLETED);
        return projectRepository.save(project);
    }

    public Map<String, Long> getStats() {
        return Map.of(
            "total", projectRepository.count(),
            "open", projectRepository.countByStatus(Project.Status.OPEN),
            "inProgress", projectRepository.countByStatus(Project.Status.IN_PROGRESS),
            "completed", projectRepository.countByStatus(Project.Status.COMPLETED)
        );
    }
}
