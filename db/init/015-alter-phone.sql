-- Adjust existing tables to phone-based identity (idempotent guards)
ALTER TABLE authdb.auth_users
  ADD COLUMN phone VARCHAR(32) UNIQUE AFTER id,
  ADD COLUMN email VARCHAR(255) NULL AFTER phone;

-- Backfill phone from email if phone was null (example heuristic: strip non-digits)
UPDATE authdb.auth_users SET phone = REGEXP_REPLACE(IFNULL(email,''),'[^0-9]','') WHERE phone IS NULL AND email IS NOT NULL;

ALTER TABLE financedb.users
  ADD COLUMN phone VARCHAR(32) UNIQUE AFTER id,
  ADD COLUMN email VARCHAR(255) NULL AFTER phone;

UPDATE financedb.users SET phone = REGEXP_REPLACE(IFNULL(email,''),'[^0-9]','') WHERE phone IS NULL AND email IS NOT NULL;
