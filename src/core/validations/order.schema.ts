import { ValidationError } from '../errors';
import type { Order, OrderItem } from '../interfaces/order';
import type { OrderStatus } from '../types/order.status';
import { isObject, toProductId, toUserId } from '../utils/type-guards';
import type { Result } from './types';

export type CreateOrderDTO = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;

const ORDER_STATUS_SET = new Set<string>([
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const);

function isOrderStatus(status: string): status is OrderStatus {
  return ORDER_STATUS_SET.has(status);
}

export const OrderSchema = {
  parse(input: unknown): Result<CreateOrderDTO, ValidationError> {
    const errors: string[] = [];

    if (!isObject(input)) {
      return {
        success: false,
        error: new ValidationError(['O payload deve ser um objeto válido.']),
      };
    }

    const data = input;

    let parsedItems: OrderItem[] = [];
    let parsedUserId = '';
    let parsedTotalPrice = 0;
    let parsedStatus: OrderStatus = 'pending';

    if (!Array.isArray(data.items) || data.items.length === 0) {
      errors.push('O campo "items" deve ser um array de itens e é obrigatório.');
    } else {
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];

        if (!isObject(item)) {
          errors.push(`O item na posição [${i}] deve ser um objeto válido.`);
          continue;
        }

        let validProductId = '';
        let validQuantity = 0;
        let validUnitPrice = 0;

        if (typeof item.productId !== 'string' || item.productId.trim().length === 0) {
          errors.push(
            `O campo "productId" do item na posição [${i}] deve ser uma string e é obrigatório.`,
          );
        } else {
          validProductId = item.productId.trim();
        }

        if (
          typeof item.quantity !== 'number' ||
          isNaN(item.quantity) ||
          item.quantity <= 0 ||
          !Number.isInteger(item.quantity)
        ) {
          errors.push(`A "quantity" no item [${i}] deve ser um número inteiro maior que zero.`);
        } else {
          validQuantity = item.quantity;
        }

        if (typeof item.unitPrice !== 'number' || isNaN(item.unitPrice) || item.unitPrice < 0) {
          errors.push(`O "unitPrice" no item [${i}] deve ser um número positivo.`);
        } else {
          validUnitPrice = item.unitPrice;
        }

        parsedItems.push({
          productId: toProductId(validProductId),
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

    if (typeof data.status !== 'string' || !isOrderStatus(data.status)) {
      errors.push(
        `O campo "status" deve ser um dos seguintes valores: ${Array.from(ORDER_STATUS_SET).join(', ')}.`,
      );
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
        items: parsedItems,
        userId: toUserId(parsedUserId),
        totalPrice: parsedTotalPrice,
        status: parsedStatus,
      },
    };
  },
};
