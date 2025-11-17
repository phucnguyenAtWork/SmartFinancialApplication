export const config = {
  port: Number(process.env.PORT || 8104),
  jwtSecret: process.env.JWT_SECRET || 'secretsecret',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  db: {
    host: process.env.DB_HOST || 'mysql-finance',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'finuser',
    password: process.env.DB_PASS || 'finpass',
    database: process.env.DB_NAME || 'financedb',
    connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
  },
};
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 8104),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwtSecret: process.env.JWT_SECRET || 'secretsecret',
  db: {
    host: process.env.DB_HOST || 'mysql-finance',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'finuser',
    pass: process.env.DB_PASS || 'finpass',
    name: process.env.DB_NAME || 'financedb',
  },
};
