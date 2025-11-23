/**
 * AuthUser domain model (phone-based identity).
 */
export class AuthUser {
  constructor({ id, phone, email = null, passwordHash, createdAt }) {
    this.id = id ?? null;
    this.phone = phone;
    this.email = email ?? null;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt ? (createdAt instanceof Date ? createdAt : new Date(createdAt)) : null;
    this.validate();
  }
  validate() {
    if (!this.phone || typeof this.phone !== 'string' || this.phone.length < 4) {
      throw new Error('Invalid phone');
    }
    if (!this.passwordHash || this.passwordHash.length < 20) {
      throw new Error('passwordHash too short (expect bcrypt)');
    }
    if (this.email && !/^[^@]+@[^@]+\.[^@]+$/.test(this.email)) {
      throw new Error('Invalid email format');
    }
  }
  static fromDb(row) {
    if (!row) return null;
    return new AuthUser({
      id: row.id,
      phone: row.phone,
      email: row.email ?? null,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
    });
  }
}
