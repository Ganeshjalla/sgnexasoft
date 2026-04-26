package com.sgnexasoft.repository;

import com.sgnexasoft.model.Payment;
import com.sgnexasoft.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByClientOrderByCreatedAtDesc(User client);
    List<Payment> findByStudentOrderByCreatedAtDesc(User student);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.student = :student AND p.status = 'RELEASED'")
    Double totalEarningsByStudent(User student);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.client = :client AND p.status != 'REFUNDED'")
    Double totalSpentByClient(User client);
}
