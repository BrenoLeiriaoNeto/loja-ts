import { FinancialId } from '../types/base';
import { BaseEntity } from './base';

export interface Financial extends BaseEntity<FinancialId> {
  readonly orders: number[];
  totalRevenue: number;
  dateOfReport: Date;
  responsiblePerson: string;
}
