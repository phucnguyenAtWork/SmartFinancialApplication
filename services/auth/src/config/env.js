export const config = {
  port: Number(process.env.PORT || 8101),
  jwtSecret: process.env.JWT_SECRET || 'secretsecret',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  db: {
    host: process.env.DB_HOST || 'mysql-auth',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'authuser',
    password: process.env.DB_PASS || 'authpass',
    database: process.env.DB_NAME || 'authdb',
    connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
  },
  financeDb: {
    host: process.env.FIN_DB_HOST || 'mysql-finance',
    port: Number(process.env.FIN_DB_PORT || 3306),
    user: process.env.FIN_DB_USER || 'finuser',
    password: process.env.FIN_DB_PASS || 'finpass',
    database: process.env.FIN_DB_NAME || 'financedb',
    connectionLimit: Number(process.env.FIN_DB_POOL_SIZE || 10),
  },
};
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 8101),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwtSecret: process.env.JWT_SECRET || 'secretsecret',
  dbAuth: {
    host: process.env.DB_HOST || 'mysql-auth',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'authuser',
    pass: process.env.DB_PASS || 'authpass',
    name: process.env.DB_NAME || 'authdb',
  },
  dbFin: {
    host: process.env.FIN_DB_HOST || 'mysql-finance',
    port: Number(process.env.FIN_DB_PORT || 3306),
    user: process.env.FIN_DB_USER || 'finuser',
    pass: process.env.FIN_DB_PASS || 'finpass',
    name: process.env.FIN_DB_NAME || 'financedb',
  },
};
