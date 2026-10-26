import { FinancialId } from '../types/base';
import { BaseEntity } from './base';
import { Order } from './order';

export interface Financial extends BaseEntity<FinancialId> {
  readonly orders: Order[];
  totalRevenue: number;
  dateOfReport: Date;
  responsiblePerson: string;
}
