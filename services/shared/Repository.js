// Simple generic repository utilities for MySQL2 pool usage.
export class Repository {
  /**
   * @param {import('mysql2/promise').Pool} pool
   * @param {string} table
   * @param {(row: any) => any} mapper
   */
  constructor(pool, table, mapper) {
    this.pool = pool;
    this.table = table;
    this.mapper = mapper;
  }
  async findById(id) {
    const [rows] = await this.pool.execute(`SELECT * FROM ${this.table} WHERE id = ?`, [id]);
    const row = rows[0];
    return row ? this.mapper(row) : null;
  }
  async insert(data) {
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?').join(',');
    const sql = `INSERT INTO ${this.table} (${keys.join(',')}) VALUES (${placeholders})`;
    const values = Object.values(data);
    const [result] = await this.pool.execute(sql, values);
    return result.insertId;
  }
  async delete(id) {
    await this.pool.execute(`DELETE FROM ${this.table} WHERE id = ?`, [id]);
  }
}
