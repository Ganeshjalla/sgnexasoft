package com.sgnexasoft.repository;

import com.sgnexasoft.model.Project;
import com.sgnexasoft.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByClientOrderByCreatedAtDesc(User client);
    List<Project> findByAssignedStudentOrderByCreatedAtDesc(User student);
    List<Project> findByStatusOrderByCreatedAtDesc(Project.Status status);
    List<Project> findByStatusInOrderByCreatedAtDesc(List<Project.Status> statuses);

    @Query("SELECT p FROM Project p WHERE p.status = 'OPEN' AND (LOWER(p.title) LIKE %:keyword% OR LOWER(p.description) LIKE %:keyword% OR LOWER(p.category) LIKE %:keyword%)")
    List<Project> searchOpenProjects(String keyword);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.status = :status")
    Long countByStatus(Project.Status status);

    @Query("SELECT SUM(p.budget) FROM Project p WHERE p.status = 'COMPLETED'")
    Double totalEarnings();

    List<Project> findByCategoryAndStatusOrderByCreatedAtDesc(String category, Project.Status status);
}
