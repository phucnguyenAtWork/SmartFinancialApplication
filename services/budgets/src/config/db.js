import mysql from 'mysql2/promise';
import { config } from './env.js';
export const pool = mysql.createPool(config.db);
import mysql from 'mysql2/promise';
import { config } from './env.js';

export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.pass,
  database: config.db.name,
  connectionLimit: 10,
});
