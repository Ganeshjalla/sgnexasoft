package com.sgnexasoft.service;

import com.sgnexasoft.exception.*;
import com.sgnexasoft.model.*;
import com.sgnexasoft.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ContractRepository contractRepository;
    private final NotificationService notificationService;

    @Transactional
    public Payment initiatePayment(Long clientId, Long projectId, Double amount) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.getClient().getId().equals(clientId)) {
            throw new BadRequestException("Not authorized");
        }

        User student = project.getAssignedStudent();
        if (student == null) {
            throw new BadRequestException("No student assigned to this project");
        }

        Payment payment = Payment.builder()
                .client(client).student(student).project(project)
                .amount(amount).status(Payment.Status.HELD)
                .transactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .type(Payment.Type.PROJECT_PAYMENT)
                .build();

        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment releasePayment(Long paymentId, Long clientId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (!payment.getClient().getId().equals(clientId)) {
            throw new BadRequestException("Not authorized");
        }
        if (payment.getStatus() != Payment.Status.HELD) {
            throw new BadRequestException("Payment is not in held state");
        }

        payment.setStatus(Payment.Status.RELEASED);

        // Add to student wallet
        User student = payment.getStudent();
        student.setWalletBalance(student.getWalletBalance() + payment.getAmount());
        userRepository.save(student);

        notificationService.create(student.getId(), "Payment Released!",
                "₹" + payment.getAmount() + " has been added to your wallet for project: "
                        + payment.getProject().getTitle(), "PAYMENT", "/transactions");

        return paymentRepository.save(payment);
    }

    public List<Payment> getClientPayments(Long clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
        return paymentRepository.findByClientOrderByCreatedAtDesc(client);
    }

    public List<Payment> getStudentPayments(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return paymentRepository.findByStudentOrderByCreatedAtDesc(student);
    }
}
