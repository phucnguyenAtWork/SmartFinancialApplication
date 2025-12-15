-- Drop all financedb tables safely
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS financedb.alerts;
DROP TABLE IF EXISTS financedb.recurring_rules;
DROP TABLE IF EXISTS financedb.transactions;
DROP TABLE IF EXISTS financedb.merchants;
DROP TABLE IF EXISTS financedb.budgets;
DROP TABLE IF EXISTS financedb.accounts;
DROP TABLE IF EXISTS financedb.categories;
DROP TABLE IF EXISTS financedb.users;
SET FOREIGN_KEY_CHECKS = 1;
