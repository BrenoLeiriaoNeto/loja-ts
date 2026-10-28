import { ValidationError } from '../errors';
import { Order, OrderItem } from '../interfaces/order';
import { OrderStatus } from '../types/order.status';
import type { Result } from './types';

export type CreateOrderDTO = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;

const VALID_ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export const OrderSchema = {
  parse(input: unknown): Result<CreateOrderDTO, ValidationError> {
    const errors: string[] = [];

    if (!input || typeof input !== 'object') {
      return {
        success: false,
        error: new ValidationError(['O payload deve ser um objeto válido.']),
      };
    }

    const data = input as Record<string, unknown>;

    let parsedItems: OrderItem[] = [];
    let parsedUserId = '';
    let parsedTotalPrice = 0;
    let parsedStatus: OrderStatus = 'pending';

    if (!Array.isArray(data.items) || data.items.length === 0) {
      errors.push('O campo "items" deve ser um array de itens e é obrigatório.');
    } else {
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];

        if (!item || typeof item !== 'object') {
          errors.push(`O item na posição [${i}] deve ser um objeto válido.`);
          continue;
        }

        const itemData = item as Record<string, unknown>;

        let validProductId = '';
        let validQuantity = 0;
        let validUnitPrice = 0;

        if (typeof itemData.productId !== 'string' || itemData.productId.trim().length === 0) {
          errors.push(
            `O campo "productId" do item na posição [${i}] deve ser uma string e é obrigatório.`,
          );
        } else {
          validProductId = itemData.productId.trim();
        }

        if (
          typeof itemData.quantity !== 'number' ||
          isNaN(itemData.quantity) ||
          itemData.quantity <= 0 ||
          !Number.isInteger(itemData.quantity)
        ) {
          errors.push(`A "quantity" no item [${i}] deve ser um número inteiro maior que zero.`);
        } else {
          validQuantity = itemData.quantity;
        }

        if (
          typeof itemData.unitPrice !== 'number' ||
          isNaN(itemData.unitPrice) ||
          itemData.unitPrice < 0
        ) {
          errors.push(`O "unitPrice" no item [${i}] deve ser um número positivo.`);
        } else {
          validUnitPrice = itemData.unitPrice;
        }

        parsedItems.push({
          productId: validProductId as any, // Este casting é necessário por causa dos IDs Nominais
          quantity: validQuantity,
          unitPrice: validUnitPrice,
        });
      }
    }

    if (typeof data.userId !== 'string' || data.userId.trim().length === 0) {
      errors.push('O campo "userId" deve ser uma string e é obrigatório.');
    } else {
      parsedUserId = data.userId.trim();
    }

    if (typeof data.totalPrice !== 'number' || isNaN(data.totalPrice) || data.totalPrice < 0) {
      errors.push('O campo "totalPrice" deve ser um número positivo.');
    } else {
      parsedTotalPrice = data.totalPrice;
    }

    if (typeof data.status !== 'string' || !VALID_ORDER_STATUSES.includes(data.status as any)) {
      errors.push(
        `O campo "status" deve ser um dos seguintes valores: ${VALID_ORDER_STATUSES.join(', ')}.`,
      );
    } else {
      parsedStatus = data.status as OrderStatus;
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
        items: parsedItems,
        userId: parsedUserId as any, // Este casting é necessário por causa dos IDs Nominais
        totalPrice: parsedTotalPrice,
        status: parsedStatus,
      },
    };
  },
};
