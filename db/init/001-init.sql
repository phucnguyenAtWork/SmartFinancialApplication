-- Create databases and service users
CREATE DATABASE IF NOT EXISTS authdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS financedb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS insightsdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'authuser'@'%' IDENTIFIED BY 'authpass';
CREATE USER IF NOT EXISTS 'finuser'@'%' IDENTIFIED BY 'finpass';
CREATE USER IF NOT EXISTS 'insights'@'%' IDENTIFIED BY 'insightspass';

GRANT ALL PRIVILEGES ON authdb.* TO 'authuser'@'%';
GRANT ALL PRIVILEGES ON financedb.* TO 'finuser'@'%';
GRANT ALL PRIVILEGES ON insightsdb.* TO 'insights'@'%';

FLUSH PRIVILEGES;
