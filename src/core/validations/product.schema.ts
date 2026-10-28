import { ValidationError } from '../errors';
import type { Product } from '../interfaces/product';
import type { ProductStatus } from '../types/product.status';
import { isObject } from '../utils/type-guards';
import type { Result } from './types';

export type CreateProductDTO = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

const PRODUCT_STATUS_SET = new Set<string>(['available', 'out_of_stock', 'discontinued']);

function isProductStatus(status: string): status is ProductStatus {
  return PRODUCT_STATUS_SET.has(status);
}

export const ProductSchema = {
  parse(input: unknown): Result<CreateProductDTO, ValidationError> {
    const errors: string[] = [];

    if (!isObject(input)) {
      return {
        success: false,
        error: new ValidationError(['O payload deve ser um objeto válido.']),
      };
    }

    const data = input;

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

    if (typeof data.status !== 'string' || !isProductStatus(data.status)) {
      errors.push(`O campo "status" deve ser ${Array.from(PRODUCT_STATUS_SET).join(', ')}.`);
    } else {
      parsedStatus = data.status;
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
