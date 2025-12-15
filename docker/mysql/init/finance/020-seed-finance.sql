-- 020-seed-finance.sql

-- 1. Connect to the correct database
USE financedb;
INSERT INTO users (id, phone, name, currency)
VALUES (1, '+84 399668879', 'Demo User', 'VND')
ON DUPLICATE KEY UPDATE 
    phone=VALUES(phone), 
    name=VALUES(name), 
    currency=VALUES(currency);

-- 3. SET VARIABLE SAFELY
SET @uid = 1;

-- 4. CRITICAL SAFETY CHECK

-- Accounts
INSERT INTO accounts (user_id, name, type, currency, friction_level)
VALUES
(@uid, 'Wallet', 'CASH', 'VND', 'HIGH'),
(@uid, 'Momo', 'WALLET', 'VND', 'LOW'),
(@uid, 'TCB', 'BANK', 'VND', 'MEDIUM'),
(@uid, 'VCB', 'BANK', 'VND', 'MEDIUM'),
(@uid, 'Zalopay', 'WALLET', 'VND', 'LOW')
ON DUPLICATE KEY UPDATE currency=VALUES(currency), friction_level=VALUES(friction_level);

-- Categories
INSERT INTO categories (user_id, name, icon, type)
VALUES
(@uid, 'Groceries', 'cart', 'EXPENSE'),
(@uid, 'Entertainment', 'film', 'EXPENSE'),
(@uid, 'Loan Payments', 'bank', 'EXPENSE'),
(@uid, 'Wages', 'briefcase', 'INCOME')
ON DUPLICATE KEY UPDATE icon=VALUES(icon), type=VALUES(type);

-- Merchants (Global list, no user_id needed)
INSERT INTO merchants (name) VALUES
('ABC Supermarket'), ('Popcorn World'), ('HQ Mutual'), ('Best Company')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Resolve IDs for Relationships
-- (We use the user_id=@uid to ensure we get *this* user's categories/accounts)
SET @acc_wallet = (SELECT id FROM accounts WHERE user_id=@uid AND name='Wallet');
SET @acc_momo = (SELECT id FROM accounts WHERE user_id=@uid AND name='Momo');
SET @acc_tcb = (SELECT id FROM accounts WHERE user_id=@uid AND name='TCB');
SET @acc_vcb = (SELECT id FROM accounts WHERE user_id=@uid AND name='VCB');
SET @acc_zalo = (SELECT id FROM accounts WHERE user_id=@uid AND name='Zalopay');

SET @cat_gro = (SELECT id FROM categories WHERE user_id=@uid AND name='Groceries');
SET @cat_ent = (SELECT id FROM categories WHERE user_id=@uid AND name='Entertainment');
SET @cat_loan = (SELECT id FROM categories WHERE user_id=@uid AND name='Loan Payments');
SET @cat_wage = (SELECT id FROM categories WHERE user_id=@uid AND name='Wages');

SET @mer_abc = (SELECT id FROM merchants WHERE name='ABC Supermarket');
SET @mer_pop = (SELECT id FROM merchants WHERE name='Popcorn World');
SET @mer_hq = (SELECT id FROM merchants WHERE name='HQ Mutual');
SET @mer_best = (SELECT id FROM merchants WHERE name='Best Company');

-- Budgets
INSERT INTO budgets (user_id, category_id, amount_limit, period, alert_threshold, start_date, end_date)
VALUES
(@uid, @cat_gro, 3000000, 'MONTHLY', 0.8, DATE_FORMAT(NOW(), '%Y-%m-01'), LAST_DAY(NOW())),
(@uid, @cat_ent, 1000000, 'MONTHLY', 0.8, DATE_FORMAT(NOW(), '%Y-%m-01'), LAST_DAY(NOW()))
ON DUPLICATE KEY UPDATE amount_limit=VALUES(amount_limit);

-- Transactions
INSERT INTO transactions (user_id, type, amount, currency, description, category_id, merchant_id, account_id, essential, tags, occurred_at)
VALUES
(@uid, 'INCOME', 35000000, 'VND', 'Monthly wage', @cat_wage, @mer_best, @acc_vcb, TRUE, JSON_ARRAY('salary'), NOW()),
(@uid, 'EXPENSE', 2673000, 'VND', 'Loan principal payment', @cat_loan, @mer_hq, @acc_tcb, TRUE, JSON_ARRAY('loan'), NOW() - INTERVAL 2 DAY),
(@uid, 'EXPENSE', 818700, 'VND', 'Grocery shopping', @cat_gro, @mer_abc, @acc_zalo, TRUE, JSON_ARRAY('food'), NOW() - INTERVAL 4 DAY),
(@uid, 'EXPENSE', 326400, 'VND', 'Going to the movies', @cat_ent, @mer_pop, @acc_momo, FALSE, JSON_ARRAY('fun'), NOW() - INTERVAL 6 DAY)
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Recurring Rules
INSERT INTO recurring_rules (user_id, category_id, merchant_id, amount, frequency, next_due_date, is_active)
VALUES
(@uid, @cat_loan, @mer_hq, 2673000, 'MONTHLY', DATE_ADD(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 1 MONTH), TRUE)
ON DUPLICATE KEY UPDATE amount=VALUES(amount);

-- Alerts
INSERT INTO alerts (user_id, type, message, is_read)
VALUES (@uid, 'AI_ADVICE', 'Spending on low-friction accounts increased 25% this week.', FALSE);