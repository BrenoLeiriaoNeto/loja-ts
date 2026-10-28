import type { ValidationError } from '@/core/errors';
import { NotFoundError } from '@/core/errors';
import type { Product } from '@/core/interfaces/product';
import { toProductId } from '@/core/utils/type-guards';
import { ProductSchema } from '@/core/validations/product.schema';
import type { Result } from '@/core/validations/types';
import { Database } from '@/storage/memory-db';

export const ProductRepository = {
  create(input: unknown): Result<Product, ValidationError> {
    const result = ProductSchema.parse(input);

    if (!result.success) {
      return result;
    }

    const now = new Date();
    const newId = toProductId(crypto.randomUUID());

    const newProduct = {
      id: newId,
      name: result.data.name,
      description: result.data.description,
      price: result.data.price,
      status: result.data.status,
      createdAt: now,
      updatedAt: now,
    };

    Database.products.set(newId, newProduct);

    return {
      success: true as const,
      data: newProduct,
    };
  },

  findById(id: string): Result<Product, NotFoundError> {
    const product = Database.products.get(toProductId(id));

    if (!product) {
      return {
        success: false as const,
        error: new NotFoundError('Product', id),
      };
    }

    return {
      success: true as const,
      data: product,
    };
  },

  listAll(): Product[] {
    return Array.from(Database.products.values());
  },
};
