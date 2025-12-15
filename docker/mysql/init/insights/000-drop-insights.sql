-- Drop all insightsdb tables safely
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS insightsdb.chat_logs;
SET FOREIGN_KEY_CHECKS = 1;
