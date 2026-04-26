package com.sgnexasoft.repository;

import com.sgnexasoft.model.Bid;
import com.sgnexasoft.model.Project;
import com.sgnexasoft.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByProjectOrderByCreatedAtDesc(Project project);
    List<Bid> findByStudentOrderByCreatedAtDesc(User student);
    Optional<Bid> findByStudentAndProject(User student, Project project);
    boolean existsByStudentAndProject(User student, Project project);
    List<Bid> findByProjectAndStatus(Project project, Bid.Status status);
    Long countByProject(Project project);
}
