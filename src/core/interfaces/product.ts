import type { ProductId } from '../types/base';
import type { ProductStatus } from '../types/product.status';
import type { BaseEntity } from './base';

export interface Product extends BaseEntity<ProductId> {
  name: string;
  description: string;
  price: number;
  status: ProductStatus;
}
