import type { FinancialId } from '../types/base';
import type { BaseEntity } from './base';
import type { Order } from './order';

export interface Financial extends BaseEntity<FinancialId> {
  readonly orders: Order[];
  totalRevenue: number;
  dateOfReport: Date;
  responsiblePerson: string;
}
