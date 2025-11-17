/** User domain model */
export class User {
  /**
   * @param {Object} props
   * @param {number|undefined} props.id
   * @param {string} props.email
   * @param {string|null} props.name
   * @param {Date|undefined} props.createdAt
   */
  constructor({ id, email, name, createdAt }) {
    this.id = id ?? null;
    this.email = email;
    this.name = name ?? null;
    this.createdAt = createdAt ?? null;
    this.validate();
  }
  validate() {
    if (!this.email || !/^[^@]+@[^@]+\.[^@]+$/.test(this.email)) throw new Error('Invalid email');
    if (this.name && this.name.length > 255) throw new Error('Name too long');
  }
  static fromDb(row) {
    return new User({
      id: row.id,
      email: row.email,
      name: row.name ?? null,
      createdAt: row.created_at ? new Date(row.created_at) : null,
    });
  }
}
