package com.sgnexasoft.repository;

import com.sgnexasoft.model.Contract;
import com.sgnexasoft.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    List<Contract> findByClientOrderByCreatedAtDesc(User client);
    List<Contract> findByStudentOrderByCreatedAtDesc(User student);
    Optional<Contract> findByProjectId(Long projectId);
}
