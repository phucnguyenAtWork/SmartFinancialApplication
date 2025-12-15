-- 3. INSIGHTS SERVICE (AI Memory)
CREATE DATABASE IF NOT EXISTS insightsdb;

CREATE TABLE IF NOT EXISTS insightsdb.chat_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  user_query TEXT,
  ai_response TEXT,
  context_snapshot JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
