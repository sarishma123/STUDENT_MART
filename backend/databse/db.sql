
-- On-Campus Mart Database
-- BCA 4th Semester Project
-- Create this database in phpMyAdmin and run these queries
 
CREATE DATABASE IF NOT EXISTS on_campus_mart;
USE on_campus_mart;
 
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  campus VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(50) NOT NULL,
  category_icon VARCHAR(50)
);
 
-- Products Table
CREATE TABLE IF NOT EXISTS products (
  product_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  category_id INT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  `condition` VARCHAR(20) NOT NULL,
  image VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);
 
-- Insert Default Categories
INSERT INTO categories (category_name, category_icon) VALUES
('📚 Books', '📚'),
('📝 Notes & Study Material', '📝'),
('🧮 Calculators', '🧮'),
('🔬 Lab Equipment', '🔬'),
('🖊️ Stationery', '🖊️'),
('💻 Electronics', '💻'),
('🪑 Hostel Essentials', '🪑'),
('🎒 Bags & Accessories', '🎒'),
('📖 Other', '📖');
 
-- Create indexes for better performance
CREATE INDEX idx_user_id ON products(user_id);
CREATE INDEX idx_category_id ON products(category_id);
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_status ON products(status);
 