import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 8104),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwtSecret: process.env.JWT_SECRET || 'secretsecret',
  db: {
    host: process.env.DB_HOST || 'mysql-finance',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    pass: process.env.DB_PASS || 'rootpass',
    name: process.env.DB_NAME || 'financedb',
  },
};
