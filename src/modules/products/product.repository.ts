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
      success: true,
      data: newProduct,
    };
  },

  findById(id: string): Result<Product, NotFoundError> {
    const product = Database.products.get(toProductId(id));

    if (!product) {
      return {
        success: false,
        error: new NotFoundError('Product', id),
      };
    }

    return {
      success: true,
      data: product,
    };
  },

  findByName(name: string): Result<Product[], NotFoundError> {
    const searchTerm = name.trim().toLowerCase();

    if (searchTerm.length === 0) {
      return {
        success: false,
        error: new NotFoundError('User', 'termo de busca vazio'),
      };
    }

    const matchedTerm = Array.from(Database.products.values()).filter((p) =>
      p.name.toLowerCase().includes(searchTerm),
    );

    return {
      success: true,
      data: matchedTerm,
    };
  },

  listAll(): Product[] {
    return Array.from(Database.products.values());
  },
};
