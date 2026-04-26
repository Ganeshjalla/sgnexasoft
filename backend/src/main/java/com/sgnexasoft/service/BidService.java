package com.sgnexasoft.service;

import com.sgnexasoft.exception.*;
import com.sgnexasoft.model.*;
import com.sgnexasoft.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public Bid placeBid(Long studentId, Long projectId, String proposal, Double bidAmount, Integer deliveryDays) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (student.getRole() != User.Role.STUDENT) {
            throw new BadRequestException("Only students can bid");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (project.getStatus() != Project.Status.OPEN) {
            throw new BadRequestException("Project is not accepting bids");
        }

        if (bidRepository.existsByStudentAndProject(student, project)) {
            throw new BadRequestException("You already bid on this project");
        }

        Bid bid = Bid.builder()
                .student(student).project(project)
                .proposal(proposal).bidAmount(bidAmount)
                .deliveryDays(deliveryDays).status(Bid.Status.PENDING)
                .build();

        Bid saved = bidRepository.save(bid);

        // Notify client
        notificationService.create(project.getClient().getId(), "New Bid Received",
                student.getName() + " bid ₹" + bidAmount + " on: " + project.getTitle(),
                "BID", "/projects/" + projectId + "/bids");

        return saved;
    }

    public List<Bid> getBidsForProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        return bidRepository.findByProjectOrderByCreatedAtDesc(project);
    }

    public List<Bid> getStudentBids(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return bidRepository.findByStudentOrderByCreatedAtDesc(student);
    }
}
