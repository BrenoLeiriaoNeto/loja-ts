import { ValidationError } from '../errors';
import type { Product } from '../interfaces/product';
import type { ProductStatus } from '../types/product.status';
import type { ValidationResult } from './types';

export type CreateProductDTO = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

const VALID_STATUSES = ['available', 'out_of_stock', 'discontinued'] as const;

export const ProductSchema = {
  parse(input: unknown): ValidationResult<CreateProductDTO> {
    const errors: string[] = [];

    if (!input || typeof input !== 'object') {
      return {
        success: false,
        error: new ValidationError(['O payload deve ser um objeto válido.']),
      };
    }

    const data = input as Record<string, unknown>;

    let parsedName = '';
    let parsedDescription = '';
    let parsedPrice = 0;
    let parsedStatus: ProductStatus = 'available';

    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('O campo "name" deve ser uma string e é obrigatório.');
    } else {
      parsedName = data.name.trim();
    }

    if (typeof data.description !== 'string' || data.description.trim().length === 0) {
      errors.push('O campo "description" deve ser uma string com conteúdo.');
    } else {
      parsedDescription = data.description.trim();
    }

    if (typeof data.price !== 'number' || isNaN(data.price) || data.price < 0) {
      errors.push('O campo "price" deve ser um número válido e positivo.');
    } else {
      parsedPrice = data.price;
    }

    if (typeof data.status !== 'string' || !VALID_STATUSES.includes(data.status as any)) {
      errors.push(`O campo "status" deve ser ${VALID_STATUSES.join(', ')}.`);
    } else {
      parsedStatus = data.status as ProductStatus;
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: new ValidationError(errors),
      };
    }

    return {
      success: true,
      data: {
        name: parsedName,
        description: parsedDescription,
        price: parsedPrice,
        status: parsedStatus,
      },
    };
  },
};
