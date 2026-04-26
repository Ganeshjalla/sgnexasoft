package com.sgnexasoft.service;

import com.sgnexasoft.exception.*;
import com.sgnexasoft.model.*;
import com.sgnexasoft.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    @Transactional
    public Review createReview(Long reviewerId, Long revieweeId, Long projectId, Integer rating, String comment) {
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));
        User reviewee = userRepository.findById(revieweeId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewee not found"));
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (reviewRepository.existsByReviewerAndProjectId(reviewer, projectId)) {
            throw new BadRequestException("You already reviewed this project");
        }

        Review review = Review.builder()
                .reviewer(reviewer).reviewee(reviewee)
                .project(project).rating(rating).comment(comment)
                .build();

        Review saved = reviewRepository.save(review);

        // Update reviewee's average rating
        Double avg = reviewRepository.avgRatingByUser(reviewee);
        long count = reviewRepository.findByRevieweeOrderByCreatedAtDesc(reviewee).size();
        reviewee.setRating(avg != null ? avg : 0.0);
        reviewee.setTotalRatings((int) count);
        userRepository.save(reviewee);

        return saved;
    }

    public List<Review> getUserReviews(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return reviewRepository.findByRevieweeOrderByCreatedAtDesc(user);
    }
}
