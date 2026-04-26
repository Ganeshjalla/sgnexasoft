package com.sgnexasoft.repository;

import com.sgnexasoft.model.Submission;
import com.sgnexasoft.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByStudentOrderBySubmittedAtDesc(User student);
    Optional<Submission> findByProjectId(Long projectId);
    List<Submission> findByProjectIdOrderBySubmittedAtDesc(Long projectId);
}
