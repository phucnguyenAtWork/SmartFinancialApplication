export class Budget {
  constructor({ id=null, userId, name, period, limitAmount, currency, startsOn=null, createdAt=new Date() }) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.period = period;
    this.limitAmount = Number(limitAmount);
    this.currency = currency;
    this.startsOn = startsOn ? (startsOn instanceof Date ? startsOn : new Date(startsOn)) : null;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
  }
  static fromDb(row) {
    if (!row) return null;
    return new Budget({ id: row.id, userId: row.user_id, name: row.name, period: row.period, limitAmount: row.limit_amount, currency: row.currency, startsOn: row.starts_on, createdAt: row.created_at });
  }
}
/** Budget domain model */
const PERIODS = new Set(['weekly','monthly','yearly']);
export class Budget {
  /**
   * @param {Object} props
   * @param {number|undefined} props.id
   * @param {number} props.userId
   * @param {string} props.name
   * @param {string} props.period
   * @param {number} props.limitAmount
   * @param {string} props.currency
   * @param {string|Date|null} props.startsOn
   * @param {Date|undefined} props.createdAt
   */
  constructor({ id, userId, name, period, limitAmount, currency, startsOn, createdAt }) {
    this.id = id ?? null;
    this.userId = userId;
    this.name = name;
    this.period = period;
    this.limitAmount = Number(limitAmount);
    this.currency = currency;
    this.startsOn = startsOn ? (startsOn instanceof Date ? startsOn : new Date(startsOn)) : null;
    this.createdAt = createdAt ?? null;
    this.validate();
  }
  validate() {
    if (!this.userId || this.userId < 1) throw new Error('Invalid userId');
    if (!this.name) throw new Error('Name required');
    if (!PERIODS.has(this.period)) throw new Error('Invalid period');
    if (!(this.limitAmount >= 0)) throw new Error('limitAmount must be >= 0');
    if (!this.currency || this.currency.length !== 3) throw new Error('currency must be 3 chars');
  }
  static fromDb(row) {
    return new Budget({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      period: row.period,
      limitAmount: Number(row.limit_amount),
      currency: row.currency,
      startsOn: row.starts_on ?? null,
      createdAt: row.created_at ? new Date(row.created_at) : null,
    });
  }
}
