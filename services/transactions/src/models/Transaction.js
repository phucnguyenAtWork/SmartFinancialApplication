/** Transaction domain model */
export class Transaction {
  /**
   * @param {Object} props
   * @param {number|undefined} props.id
   * @param {number} props.userId
   * @param {number} props.amount
   * @param {string} props.currency
   * @param {string|null} props.category
   * @param {string|null} props.description
   * @param {Date|string} props.occurredAt
   * @param {Date|undefined} props.createdAt
   */
  constructor({ id, userId, amount, currency, category, description, occurredAt, createdAt }) {
    this.id = id ?? null;
    this.userId = userId;
    this.amount = Number(amount);
    this.currency = currency;
    this.category = category ?? null;
    this.description = description ?? null;
    this.occurredAt = occurredAt instanceof Date ? occurredAt : new Date(occurredAt);
    this.createdAt = createdAt ?? null;
    this.validate();
  }
  validate() {
    if (!this.userId || this.userId < 1) throw new Error('Invalid userId');
    if (!Number.isFinite(this.amount)) throw new Error('amount must be number');
    if (!this.currency || this.currency.length !== 3) throw new Error('currency must be 3 chars');
    if (!(this.occurredAt instanceof Date) || isNaN(this.occurredAt.getTime())) throw new Error('occurredAt invalid');
  }
  static fromDb(row) {
    return new Transaction({
      id: row.id,
      userId: row.user_id,
      amount: Number(row.amount),
      currency: row.currency,
      category: row.category ?? null,
      description: row.description ?? null,
      occurredAt: row.occurred_at,
      createdAt: row.created_at ? new Date(row.created_at) : null,
    });
  }
}
