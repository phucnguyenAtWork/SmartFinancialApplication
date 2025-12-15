/** Transaction domain model aligned to new schema */
export class Transaction {
  /**
   * @param {Object} props
   * @param {number|undefined} props.id
   * @param {number} props.userId
   * @param {string} props.type // 'EXPENSE'|'INCOME'|'TRANSFER'
   * @param {number} props.amount
   * @param {string} props.currency // e.g., 'VND'
   * @param {string|null} props.description
   * @param {number|null} props.categoryId
   * @param {number|null} props.merchantId
   * @param {number|null} props.accountId
   * @param {number|null} props.toAccountId
   * @param {boolean} props.essential
   * @param {any|null} props.tags // JSON array
   * @param {Date|string} props.occurredAt
   * @param {Date|undefined} props.createdAt
   */
  constructor({ id, userId, type, amount, currency, description, categoryId=null, merchantId=null, accountId=null, toAccountId=null, essential=false, tags=null, occurredAt, createdAt }) {
    this.id = id ?? null;
    this.userId = userId;
    this.type = type;
    this.amount = Number(amount);
    this.currency = currency;
    this.description = description ?? null;
    this.categoryId = categoryId;
    this.merchantId = merchantId;
    this.accountId = accountId;
    this.toAccountId = toAccountId;
    this.essential = Boolean(essential);
    this.tags = tags ?? null;
    this.occurredAt = occurredAt instanceof Date ? occurredAt : new Date(occurredAt);
    this.createdAt = createdAt ?? null;
    this.validate();
  }
  validate() {
    if (!this.userId || this.userId < 1) throw new Error('Invalid userId');
    if (!this.type || !['EXPENSE','INCOME','TRANSFER'].includes(this.type)) throw new Error('Invalid type');
    if (!Number.isFinite(this.amount)) throw new Error('amount must be number');
    if (!this.currency || this.currency.length < 3) throw new Error('currency required');
    if (this.type === 'TRANSFER' && !this.toAccountId) throw new Error('toAccountId required for transfer');
    if (!(this.occurredAt instanceof Date) || isNaN(this.occurredAt.getTime())) throw new Error('occurredAt invalid');
  }
  static fromDb(row) {
    return new Transaction({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      amount: Number(row.amount),
      currency: row.currency,
      description: row.description ?? null,
      categoryId: row.category_id ?? null,
      merchantId: row.merchant_id ?? null,
      accountId: row.account_id ?? null,
      toAccountId: row.to_account_id ?? null,
      essential: !!row.essential,
      tags: row.tags ?? null,
      occurredAt: row.occurred_at,
      createdAt: row.created_at ? new Date(row.created_at) : null,
    });
  }
}
