export class AuthUser {
  constructor({ id = null, email, passwordHash, createdAt = new Date() }) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
  }
  static fromDb(row) {
    if (!row) return null;
    return new AuthUser({ id: row.id, email: row.email, passwordHash: row.password_hash, createdAt: row.created_at });
  }
}
/**
 * AuthUser domain model representing a row in auth_users.
 * Provides simple factory and validation.
 */
export class AuthUser {
  /**
   * @param {Object} props
   * @param {number|undefined} props.id
   * @param {string} props.email
   * @param {string} props.passwordHash
   * @param {Date|undefined} props.createdAt
   */
  constructor({ id, email, passwordHash, createdAt }) {
    this.id = id ?? null;
    this.email = email;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt ?? null;
    this.validate();
  }
  validate() {
    if (!this.email || !/^[^@]+@[^@]+\.[^@]+$/.test(this.email)) {
      throw new Error('Invalid email');
    }
    if (!this.passwordHash || this.passwordHash.length < 20) {
      throw new Error('passwordHash too short (expect bcrypt)');
    }
  }
  static fromDb(row) {
    return new AuthUser({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at ? new Date(row.created_at) : null,
    });
  }
}
