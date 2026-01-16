export const config = {
  port: Number(process.env.PORT || 8103),
  jwtSecret: process.env.JWT_SECRET || 'secretsecret',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  db: {
    host: process.env.DB_HOST || 'mysql-finance',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'rootpass',
    database: process.env.DB_NAME || 'financedb',
    connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
  },
};
