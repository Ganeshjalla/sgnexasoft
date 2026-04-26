package com.sgnexasoft.repository;

import com.sgnexasoft.model.Review;
import com.sgnexasoft.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRevieweeOrderByCreatedAtDesc(User reviewee);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee = :user")
    Double avgRatingByUser(User user);

    boolean existsByReviewerAndProjectId(User reviewer, Long projectId);
}
