import type { Financial } from '@/core/interfaces/financial';
import type { Order } from '@/core/interfaces/order';
import type { Product } from '@/core/interfaces/product';
import type { User } from '@/core/interfaces/user';
import type { FinancialId, OrderId, ProductId, UserId } from '@/core/types/base';

export const Database: {
  users: Map<UserId, User>;
  products: Map<ProductId, Product>;
  orders: Map<OrderId, Order>;
  financials: Map<FinancialId, Financial>;
  clearAll(): void;
} = {
  users: new Map<UserId, User>(),
  products: new Map<ProductId, Product>(),
  orders: new Map<OrderId, Order>(),
  financials: new Map<FinancialId, Financial>(),

  clearAll(): void {
    this.users.clear();
    this.products.clear();
    this.orders.clear();
    this.financials.clear();
  },
};
