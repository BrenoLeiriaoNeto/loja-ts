import type { ProductId } from '../types/base';
import type { ProductStatus } from '../types/product.status';
import type { BaseEntity } from './base';

export interface Product extends BaseEntity<ProductId> {
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly stockQuantity: number;
  readonly status: ProductStatus;
}
