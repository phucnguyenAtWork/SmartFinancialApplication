-- Drop all authdb tables safely
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS authdb.auth_users;
SET FOREIGN_KEY_CHECKS = 1;
