import { OrderId } from '../types/base';
import { OrderStatus } from '../types/order.status';
import { BaseEntity } from './base';

export interface OrderItem {
  readonly productId: number;
  quantity: number;
  readonly unitPrice: number;
}

export interface Order extends BaseEntity<OrderId> {
  readonly userId: number;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
}
