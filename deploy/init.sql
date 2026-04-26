-- SGNexasoft Database Initialization
-- This runs automatically when the MySQL container first starts

CREATE DATABASE IF NOT EXISTS sgnexasoft_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sgnexasoft_db;

-- Demo users are inserted AFTER Spring Boot creates the tables via JPA.
-- Use the deploy/seed.sql script for demo data after first startup.
-- This file just ensures the DB and charset are set correctly.

SET GLOBAL time_zone = '+05:30';
