import type { FinancialId } from '../types/base';
import type { BaseEntity } from './base';
import type { Order } from './order';

export interface Financial extends BaseEntity<FinancialId> {
  readonly orders: readonly Order[];
  readonly totalRevenue: number;
  readonly dateOfReport: Date;
  readonly responsiblePerson: string;
}
