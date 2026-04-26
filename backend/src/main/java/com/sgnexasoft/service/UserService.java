package com.sgnexasoft.service;

import com.sgnexasoft.exception.*;
import com.sgnexasoft.model.User;
import com.sgnexasoft.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final ProjectRepository projectRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User updateProfile(Long userId, String name, String phone, String bio,
                               String skills, String portfolioUrl) {
        User user = getById(userId);
        if (name != null) user.setName(name);
        if (phone != null) user.setPhone(phone);
        if (bio != null) user.setBio(bio);
        if (skills != null) user.setSkills(skills);
        if (portfolioUrl != null) user.setPortfolioUrl(portfolioUrl);
        return userRepository.save(user);
    }

    public User uploadAvatar(Long userId, MultipartFile file) throws IOException {
        User user = getById(userId);
        Files.createDirectories(Paths.get(uploadDir + "avatars/"));
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path path = Paths.get(uploadDir + "avatars/" + fileName);
        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
        user.setAvatarUrl("/uploads/avatars/" + fileName);
        return userRepository.save(user);
    }

    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = getById(userId);
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Old password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public List<User> getAllStudents() {
        return userRepository.findByRoleAndActiveTrue(User.Role.STUDENT);
    }

    public List<User> getAllClients() {
        return userRepository.findByRoleAndActiveTrue(User.Role.CLIENT);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void toggleUserStatus(Long userId) {
        User user = getById(userId);
        user.setActive(!user.getActive());
        userRepository.save(user);
    }

    public java.util.Map<String, Object> getDashboardStats(Long userId) {
        User user = getById(userId);
        java.util.Map<String, Object> stats = new java.util.HashMap<>();

        if (user.getRole() == User.Role.STUDENT) {
            Double earnings = paymentRepository.totalEarningsByStudent(user);
            stats.put("totalEarnings", earnings != null ? earnings : 0.0);
            stats.put("walletBalance", user.getWalletBalance());
            stats.put("totalProjects", projectRepository.findByAssignedStudentOrderByCreatedAtDesc(user).size());
            stats.put("rating", user.getRating());
        } else if (user.getRole() == User.Role.CLIENT) {
            Double spent = paymentRepository.totalSpentByClient(user);
            stats.put("totalSpent", spent != null ? spent : 0.0);
            stats.put("totalProjects", projectRepository.findByClientOrderByCreatedAtDesc(user).size());
        } else {
            stats.put("totalUsers", userRepository.count());
            stats.put("totalStudents", userRepository.countByRole(User.Role.STUDENT));
            stats.put("totalClients", userRepository.countByRole(User.Role.CLIENT));
            stats.put("totalProjects", projectRepository.count());
        }
        return stats;
    }
}
