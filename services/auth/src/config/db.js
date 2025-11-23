import mysql from 'mysql2/promise';
import { config } from './env.js';

export const authPool = mysql.createPool({
  host: config.dbAuth.host,
  port: config.dbAuth.port,
  user: config.dbAuth.user,
  password: config.dbAuth.pass,
  database: config.dbAuth.name,
  connectionLimit: 10,
  connectTimeout: 8000,
  queueLimit: 0,
});

export const finPool = mysql.createPool({
  host: config.dbFin.host,
  port: config.dbFin.port,
  user: config.dbFin.user,
  password: config.dbFin.pass,
  database: config.dbFin.name,
  connectionLimit: 10,
  connectTimeout: 8000,
  queueLimit: 0,
});
