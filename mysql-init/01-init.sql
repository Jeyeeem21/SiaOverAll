-- Create root user that can connect from any host
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'RootPass123';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- Ensure the business_center database exists
CREATE DATABASE IF NOT EXISTS business_center;

-- Flush privileges to apply changes
FLUSH PRIVILEGES;
