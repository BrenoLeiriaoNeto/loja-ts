import type { OrderId } from '../types/base';
import type { OrderStatus } from '../types/order.status';
import type { BaseEntity } from './base';

export interface OrderItem {
  readonly productId: string;
  quantity: number;
  readonly unitPrice: number;
}

export interface Order extends BaseEntity<OrderId> {
  readonly userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
}
