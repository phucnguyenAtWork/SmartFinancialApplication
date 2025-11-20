-- auth users
CREATE TABLE IF NOT EXISTS authdb.auth_users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- finance users
CREATE TABLE IF NOT EXISTS financedb.users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- budgets
CREATE TABLE IF NOT EXISTS financedb.budgets (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  period VARCHAR(32) NOT NULL,
  limit_amount DECIMAL(14,2) DEFAULT 0,
  currency VARCHAR(8) DEFAULT 'USD',
  starts_on DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES financedb.users(id) ON DELETE CASCADE
);

-- transactions
CREATE TABLE IF NOT EXISTS financedb.transactions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  currency VARCHAR(8) DEFAULT 'USD',
  category VARCHAR(128),
  description TEXT,
  occurred_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES financedb.users(id) ON DELETE CASCADE
);

-- insights
CREATE TABLE IF NOT EXISTS insightsdb.insights_queries (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  prompt TEXT,
  response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
