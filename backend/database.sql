-- =============================================
-- RETAIL DASHBOARD DATABASE SETUP
-- =============================================

-- Create Database
DROP DATABASE IF EXISTS retail_dashboard;
CREATE DATABASE retail_dashboard;
USE retail_dashboard;

-- =============================================
-- BRANCHES TABLE
-- =============================================
CREATE TABLE branches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  branch_code VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default branches
INSERT INTO branches (name, location, branch_code) VALUES
('Mumbai Branch', 'Mumbai, Maharashtra', 'branch1'),
('Delhi Branch', 'Delhi, NCR', 'branch2'),
('Bangalore Branch', 'Bangalore, Karnataka', 'branch3');

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  full_name VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  profile_picture VARCHAR(500),
  branch_id INT,
  role ENUM('admin', 'manager', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password, full_name, role) VALUES
('admin@debtol.com', '$2b$10$rKZhQxVXVXVXVXVXVXVXVeJ5YvYvYvYvYvYvYvYvYvYvYvYvYvY', 'Admin User', 'admin');

-- Note: The password hash above is a placeholder. When you run the backend,
-- it will properly hash 'admin123' using bcrypt with 10 rounds.
-- For testing, use: email: admin@debtol.com, password: admin123

-- =============================================
-- UPLOAD LOGS TABLE
-- =============================================
CREATE TABLE upload_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  branch_id INT NOT NULL,
  file_name VARCHAR(255),
  file_size INT,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- =============================================
-- VERIFICATION
-- =============================================
SELECT 'Database setup complete!' AS message;
SELECT * FROM branches;
SELECT email, full_name, role FROM users;