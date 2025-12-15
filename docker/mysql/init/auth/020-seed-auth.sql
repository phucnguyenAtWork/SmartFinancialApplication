-- Seed demo auth user
USE authdb;
INSERT INTO auth_users (id,phone, email, password_hash, full_name)
VALUES (1,'+84 399668879', 'demo@example.com', '$2b$10$demoHash', 'Demo User')
ON DUPLICATE KEY UPDATE email=VALUES(email), full_name=VALUES(full_name);

INSERT INTO auth_users (id,phone, email, password_hash, full_name)
VALUES(2,'0901234567', 'demo2@example.com', '$2b$10$demoHash2', 'Demo User 2')
ON DUPLICATE KEY UPDATE email=VALUES(email), full_name=VALUES(full_name);