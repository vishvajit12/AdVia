-- =====================================================================
-- AdVia — Smart Transit Ad Network
-- MySQL Database Schema
-- =====================================================================
-- Run this file to create the database, all tables, relationships,
-- and seed it with sample data for local development / demo.
--
-- Usage:
--   mysql -u root -p < schema.sql
-- =====================================================================

DROP DATABASE IF EXISTS advia_db;
CREATE DATABASE advia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE advia_db;

-- ---------------------------------------------------------------------
-- 1. USERS
-- Core account table for every person on the platform.
-- role decides which profile table (drivers / advertisers) applies.
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)        NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password      VARCHAR(255)        NOT NULL,   -- bcrypt hash
    phone         VARCHAR(20),
    role          ENUM('driver', 'advertiser', 'admin') NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. DRIVERS
-- Extra profile data for users with role = 'driver'.
-- One-to-one with users.
-- ---------------------------------------------------------------------
CREATE TABLE drivers (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL UNIQUE,
    vehicle_number  VARCHAR(20)  UNIQUE NOT NULL,
    vehicle_type    ENUM('Auto-rickshaw', 'Taxi', 'Bike', 'Delivery Van') NOT NULL,
    route_area      VARCHAR(150) NOT NULL,         -- primary operating area / route
    upi_id          VARCHAR(100),
    rating          DECIMAL(3,2) DEFAULT 5.00,
    is_verified     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_drivers_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. ADVERTISERS
-- Extra profile data for users with role = 'advertiser'.
-- One-to-one with users.
-- ---------------------------------------------------------------------
CREATE TABLE advertisers (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT NOT NULL UNIQUE,
    business_name  VARCHAR(150) NOT NULL,
    business_type  VARCHAR(100) NOT NULL,
    address        VARCHAR(255),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_advertisers_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. CAMPAIGNS
-- An advertiser's ad-booking order. One advertiser -> many campaigns.
-- ---------------------------------------------------------------------
CREATE TABLE campaigns (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    advertiser_id    INT NOT NULL,
    title            VARCHAR(150) NOT NULL,
    target_area      VARCHAR(150) NOT NULL,
    vehicle_type     ENUM('Auto-rickshaw', 'Taxi', 'Bike', 'Delivery Van', 'Mix (Auto + Bike)') NOT NULL,
    vehicle_count    INT NOT NULL,
    duration_months  INT NOT NULL,
    status           ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft',
    estimated_cost   DECIMAL(10,2) NOT NULL,
    start_date       DATE,
    end_date         DATE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_campaigns_advertiser
        FOREIGN KEY (advertiser_id) REFERENCES advertisers(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. JOBS
-- Links a campaign to a specific driver's vehicle ("ad job offer").
-- One campaign -> many jobs (one per matched vehicle).
-- ---------------------------------------------------------------------
CREATE TABLE jobs (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id   INT NOT NULL,
    driver_id     INT NOT NULL,
    status        ENUM('offered', 'accepted', 'declined', 'completed') DEFAULT 'offered',
    monthly_pay   DECIMAL(10,2) NOT NULL,
    offered_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at  TIMESTAMP NULL,

    CONSTRAINT fk_jobs_campaign
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_jobs_driver
        FOREIGN KEY (driver_id) REFERENCES drivers(id)
        ON DELETE CASCADE,

    -- a driver can only be offered a given campaign once
    UNIQUE KEY uniq_campaign_driver (campaign_id, driver_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. NOTIFICATIONS
-- In-app notifications for any user (driver or advertiser).
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    title       VARCHAR(150) NOT NULL,
    message     TEXT NOT NULL,
    type        ENUM('job', 'payment', 'info', 'system') DEFAULT 'info',
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. PAYMENTS
-- Driver payouts for completed ad jobs.
-- ---------------------------------------------------------------------
CREATE TABLE payments (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    job_id      INT NOT NULL,
    driver_id   INT NOT NULL,
    amount      DECIMAL(10,2) NOT NULL,
    status      ENUM('pending', 'paid') DEFAULT 'pending',
    paid_at     TIMESTAMP NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_job
        FOREIGN KEY (job_id) REFERENCES jobs(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_payments_driver
        FOREIGN KEY (driver_id) REFERENCES drivers(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. INVOICES
-- Billing records for advertisers (per campaign).
-- ---------------------------------------------------------------------
CREATE TABLE invoices (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id    INT NOT NULL,
    advertiser_id  INT NOT NULL,
    amount         DECIMAL(10,2) NOT NULL,
    status         ENUM('pending', 'paid') DEFAULT 'pending',
    issued_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at        TIMESTAMP NULL,

    CONSTRAINT fk_invoices_campaign
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_invoices_advertiser
        FOREIGN KEY (advertiser_id) REFERENCES advertisers(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- SAMPLE / SEED DATA
-- Password for ALL seeded users is:  password123
-- (hash below is bcrypt for "password123", 10 rounds)
-- =====================================================================
INSERT INTO users (name, email, password, phone, role) VALUES
('Rajesh Kamble',   'rajesh.driver@advia.in',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+91 98765 43210', 'driver'),
('Sunil Patil',     'sunil.driver@advia.in',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+91 98765 43211', 'driver'),
('Amit Joshi',      'amit.driver@advia.in',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+91 98765 43212', 'driver'),
('Sharma Medicals', 'sharma@advia.in',          '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+91 98765 00001', 'advertiser'),
('Hotel Sai Inn',   'saiinn@advia.in',          '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+91 98765 00002', 'advertiser'),
('Admin User',      'admin@advia.in',           '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+91 90000 00000', 'admin');

INSERT INTO drivers (user_id, vehicle_number, vehicle_type, route_area, upi_id, rating, is_verified) VALUES
(1, 'MH11-AK-4521', 'Auto-rickshaw', 'Miraj Road, Sangli',      'rajesh.kamble@upi', 4.80, TRUE),
(2, 'MH11-BT-7832', 'Taxi',          'Station Road, Sangli',    'sunil.patil@upi',   4.60, TRUE),
(3, 'MH11-CC-1190', 'Bike',          'Vishrambaug, Sangli',     'amit.joshi@upi',    4.90, FALSE);

INSERT INTO advertisers (user_id, business_name, business_type, address) VALUES
(4, 'Sharma Medicals', 'Medical / Pharmacy', 'Miraj Road, Sangli, Maharashtra'),
(5, 'Hotel Sai Inn',   'Hotel',              'Station Road, Sangli, Maharashtra');

INSERT INTO campaigns (advertiser_id, title, target_area, vehicle_type, vehicle_count, duration_months, status, estimated_cost, start_date, end_date) VALUES
(1, 'Summer Offer — June',  'Miraj Road, Sangli', 'Auto-rickshaw', 15, 1, 'active',    13500.00, '2026-06-01', '2026-06-30'),
(2, 'Grand Opening — April', 'Vishrambaug + Station Rd', 'Mix (Auto + Bike)', 8, 1, 'completed', 7200.00, '2026-04-01', '2026-04-30'),
(1, 'Festive Special — Diwali', 'City-wide', 'Auto-rickshaw', 30, 2, 'draft', 54000.00, NULL, NULL);

INSERT INTO jobs (campaign_id, driver_id, status, monthly_pay, responded_at) VALUES
(1, 1, 'accepted', 900.00, NOW()),
(1, 2, 'offered',  900.00, NULL),
(2, 3, 'completed', 600.00, NOW());

INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(1, 'New ad job available!', 'Sharma Medicals wants autos on Miraj Road. ₹900/month.', 'job', FALSE),
(1, 'Payment received', '₹600 credited for April campaign — Grand Opening.', 'payment', FALSE),
(2, 'New ad job available!', 'Sharma Medicals wants autos on Miraj Road. ₹900/month.', 'job', TRUE),
(4, 'Campaign is live', 'Your campaign "Summer Offer — June" is now active.', 'system', FALSE);

INSERT INTO payments (job_id, driver_id, amount, status, paid_at) VALUES
(1, 1, 900.00, 'pending', NULL),
(3, 3, 600.00, 'paid', '2026-05-02 10:00:00');

INSERT INTO invoices (campaign_id, advertiser_id, amount, status, paid_at) VALUES
(1, 1, 13500.00, 'paid', '2026-06-01 09:00:00'),
(2, 1, 7200.00,  'paid', '2026-04-01 09:00:00');
