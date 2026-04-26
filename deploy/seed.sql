-- SGNexasoft Demo Data Seed
-- Run this AFTER the app has started at least once (so JPA creates the tables)
-- Passwords are BCrypt hashed:
--   admin123   -> $2a$10$...
--   client123  -> $2a$10$...
--   student123 -> $2a$10$...

USE sgnexasoft_db;

-- Insert demo users (password = BCrypt of role+123)
INSERT IGNORE INTO users (name, email, password, role, wallet_balance, rating, total_ratings, active, created_at, updated_at)
VALUES
  ('Admin User',    'admin@sg.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhy2', 'ADMIN',   0.0, 0.0, 0, true, NOW(), NOW()),
  ('Rahul Sharma',  'client@sg.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhy2', 'CLIENT',  0.0, 0.0, 0, true, NOW(), NOW()),
  ('Priya Singh',   'student@sg.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhy2', 'STUDENT', 0.0, 4.5, 3, true, NOW(), NOW()),
  ('Amit Patel',    'client2@sg.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhy2', 'CLIENT',  0.0, 0.0, 0, true, NOW(), NOW()),
  ('Sneha Gupta',   'student2@sg.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhy2', 'STUDENT', 2500.0, 4.2, 5, true, NOW(), NOW());

-- NOTE: The BCrypt hash above decodes to "password123" for ALL demo accounts.
-- To use role-specific passwords (admin123, client123, student123),
-- generate new BCrypt hashes using: https://bcrypt-generator.com/
-- or run this Spring Boot snippet:
--   new BCryptPasswordEncoder().encode("admin123")

-- Insert demo projects (run after users are created)
INSERT IGNORE INTO projects (title, description, budget, deadline, status, category, skills, client_id, created_at, updated_at)
SELECT
  'Build React E-Commerce Website',
  'Need a full-featured e-commerce site with product listing, cart, checkout, and admin panel. Must use React, Spring Boot, and MySQL.',
  15000.00,
  DATE_ADD(NOW(), INTERVAL 30 DAY),
  'OPEN',
  'Web Development',
  'React, Spring Boot, MySQL, Tailwind CSS',
  u.id,
  NOW(),
  NOW()
FROM users u WHERE u.email = 'client@sg.com' LIMIT 1;

INSERT IGNORE INTO projects (title, description, budget, deadline, status, category, skills, client_id, created_at, updated_at)
SELECT
  'Android Chat App with Firebase',
  'Build a real-time chat application for Android using Firebase Realtime Database, Firebase Auth, and push notifications.',
  8000.00,
  DATE_ADD(NOW(), INTERVAL 21 DAY),
  'OPEN',
  'Mobile App',
  'Android, Java, Firebase, XML',
  u.id,
  NOW(),
  NOW()
FROM users u WHERE u.email = 'client2@sg.com' LIMIT 1;

INSERT IGNORE INTO projects (title, description, budget, deadline, status, category, skills, client_id, created_at, updated_at)
SELECT
  'ML Model for Student Performance Prediction',
  'Train a machine learning model to predict student performance based on attendance, marks, and participation. Provide a Python API.',
  12000.00,
  DATE_ADD(NOW(), INTERVAL 45 DAY),
  'OPEN',
  'Machine Learning',
  'Python, Scikit-learn, FastAPI, Pandas',
  u.id,
  NOW(),
  NOW()
FROM users u WHERE u.email = 'client@sg.com' LIMIT 1;

SELECT 'Seed data inserted successfully!' AS status;
SELECT email, role, name FROM users;
