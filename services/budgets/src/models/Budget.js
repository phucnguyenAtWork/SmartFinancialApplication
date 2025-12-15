// Legacy export removed
/** Budget domain model */
const PERIODS = new Set(['WEEKLY','MONTHLY']);
export class Budget {
  /**
   * @param {Object} props
   * @param {number|undefined} props.id
   * @param {number} props.userId
   * @param {number} props.categoryId
   * @param {number} props.amountLimit
   * @param {string} props.period // 'MONTHLY'|'WEEKLY'
   * @param {number} props.alertThreshold // 0.0-1.0
   * @param {string|Date} props.startDate
   * @param {string|Date} props.endDate
   * @param {Date|undefined} props.createdAt
   */
  constructor({ id, userId, categoryId, amountLimit, period, alertThreshold=0.8, startDate, endDate, createdAt }) {
    this.id = id ?? null;
    this.userId = userId;
    this.categoryId = categoryId;
    this.amountLimit = Number(amountLimit);
    this.period = period;
    this.alertThreshold = Number(alertThreshold);
    this.startDate = startDate instanceof Date ? startDate : new Date(startDate);
    this.endDate = endDate instanceof Date ? endDate : new Date(endDate);
    this.createdAt = createdAt ?? null;
    this.validate();
  }
  validate() {
    if (!this.userId || this.userId < 1) throw new Error('Invalid userId');
    if (!this.categoryId) throw new Error('categoryId required');
    if (!PERIODS.has(this.period)) throw new Error('Invalid period');
    if (!(this.amountLimit >= 0)) throw new Error('amountLimit must be >= 0');
    if (!(this.alertThreshold >= 0 && this.alertThreshold <= 1)) throw new Error('alertThreshold must be 0..1');
    if (!(this.startDate instanceof Date) || isNaN(this.startDate.getTime())) throw new Error('startDate invalid');
    if (!(this.endDate instanceof Date) || isNaN(this.endDate.getTime())) throw new Error('endDate invalid');
  }
  static fromDb(row) {
    return new Budget({
      id: row.id,
      userId: row.user_id,
      categoryId: row.category_id,
      amountLimit: Number(row.amount_limit),
      period: row.period,
      alertThreshold: Number(row.alert_threshold),
      startDate: row.start_date,
      endDate: row.end_date,
      createdAt: row.created_at ? new Date(row.created_at) : null,
    });
  }
}
