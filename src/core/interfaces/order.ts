import type { OrderId, ProductId, UserId } from '../types/base';
import type { OrderStatus } from '../types/order.status';
import type { BaseEntity } from './base';

export interface OrderItem {
  readonly productId: ProductId;
  readonly quantity: number;
  readonly unitPrice: number;
}

export interface Order extends BaseEntity<OrderId> {
  readonly userId: UserId;
  readonly items: readonly OrderItem[];
  readonly totalPrice: number;
  readonly status: OrderStatus;
}
