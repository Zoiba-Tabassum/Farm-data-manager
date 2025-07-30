CREATE DATABASE farmdata;
use farmdata;
 

-- USERS TABLE
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,-- company provided code
  role ENUM('admin', 'field_facilitator') NOT NULL,
  village VARCHAR(100),
  tehsil VARCHAR(100)
);

-- FARMERS TABLE
CREATE TABLE farmers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  cnic VARCHAR(20) UNIQUE NOT NULL,
  phone VARCHAR(20),
  village VARCHAR(100),
  tehsil VARCHAR(100),
  facilitator_id INT NOT NULL,
  FOREIGN KEY (facilitator_id) REFERENCES users(id)
);

-- FARM_DATA USAGE
CREATE TABLE farm_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farmer_id INT NOT NULL UNIQUE,
  area_acres DECIMAL(10,2),
  soil_type VARCHAR(100),
  irrigation_type VARCHAR(100),
  FOREIGN KEY (farmer_id) REFERENCES farmers(id)
);

-- LIVESTOCK TABLE
CREATE TABLE livestock (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farmer_id INT NOT NULL,
  animal_type VARCHAR(100),
  quantity INT,
  shelter BOOLEAN,
  clean_water BOOLEAN,
  trained BOOLEAN,
  vaccinated BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id)
);

-- LAND_PREPRATION TABLE
CREATE TABLE land_preparation (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farmer_id INT NOT NULL,
  factor VARCHAR(100),
  cost_per_acre DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id)
);

-- SEED_DATA TABLE
CREATE TABLE seed_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farmer_id INT NOT NULL,
  variety_name VARCHAR(100),
  acres DECIMAL(10,2),
  seed_per_acre DECIMAL(10,2),
  price_per_kg DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id)
);

-- PESTICIDE_USAGE TABLE
CREATE TABLE pesticide_usage (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farmer_id INT NOT NULL,
  name VARCHAR(100),
  quantity_per_ltr DECIMAL(10,2),
  spray_date DATE,
  type ENUM('natural', 'synthetic'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id)
);

-- WATER_DATA TABLE
CREATE TABLE water_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farmer_id INT NOT NULL,
  source VARCHAR(100),
  irrigation_date DATE,
  quantity_per_acre DECIMAL(10,2),
  time TIME,
  cost_per_acre DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id)
);

-- FERTILIZER_DATA TABLE
CREATE TABLE fertilizer_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farmer_id INT NOT NULL,
  type ENUM('natural', 'synthetic'),
  name VARCHAR(100),
  quantity DECIMAL(10,2),
  cost_per_acre DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id)
);
 
 -- COTTON_PICKING TABLE
CREATE TABLE cotton_picking (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farmer_id INT NOT NULL,
  average DECIMAL(10,2),
  total DECIMAL(10,2),
  rate DECIMAL(10,2),
  total_earning DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  buyer_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id)
);
