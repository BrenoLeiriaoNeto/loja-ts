import { NotFoundError, ValidationError } from '@/core/errors';
import type { Order } from '@/core/interfaces/order';
import { toOrderId, toProductId, toUserId } from '@/core/utils/type-guards';
import { OrderSchema } from '@/core/validations/order.schema';
import type { Result } from '@/core/validations/types';
import { Database } from '@/storage/memory-db';

export const OrderRepository = {
  create(input: unknown): Result<Order, ValidationError | NotFoundError> {
    const schemaResult = OrderSchema.parse(input);

    if (!schemaResult.success) {
      return schemaResult;
    }

    const { userId, items, totalPrice, status } = schemaResult.data;

    const userExists = Database.users.has(toUserId(userId));
    if (!userExists) {
      return {
        success: false as const,
        error: new NotFoundError('User', userId),
      };
    }

    const domainErrors: string[] = [];
    let calculatedTotalPrice = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue;

      const product = Database.products.get(toProductId(item.productId));

      if (!product) {
        domainErrors.push(`Produto com ID '${item.productId}' no item [${i}] não foi encontrado.`);
        continue;
      }

      if (product.status !== 'available') {
        domainErrors.push(
          `Produto '${product.name}' (ID: ${item.productId}) não está disponível para venda. Status atual: ${product.status}.`,
        );
      }

      if (item.unitPrice !== product.price) {
        domainErrors.push(
          `Preço unitário divergente no item [${i}]. Informado: R$ ${item.unitPrice}, Catálogo: R$ ${product.price}.`,
        );
      }

      calculatedTotalPrice += product.price * item.quantity;
    }

    if (totalPrice !== calculatedTotalPrice) {
      domainErrors.push(
        `Preço total do pedido divergente. Informado: R$ ${totalPrice}, Calculado pelo catálogo: R$ ${calculatedTotalPrice}.`,
      );
    }

    if (domainErrors.length > 0) {
      return {
        success: false as const,
        error: new ValidationError(domainErrors),
      };
    }

    const now = new Date();
    const newId = toOrderId(crypto.randomUUID());

    const newOrder: Order = {
      id: newId,
      userId,
      items,
      totalPrice: calculatedTotalPrice,
      status,
      createdAt: now,
      updatedAt: now,
    };

    Database.orders.set(newId, newOrder);

    return {
      success: true as const,
      data: newOrder,
    };
  },

  findById(id: string): Result<Order, NotFoundError> {
    const order = Database.orders.get(toOrderId(id));

    if (!order) {
      return {
        success: false as const,
        error: new NotFoundError('Order', id),
      };
    }

    return {
      success: true as const,
      data: order,
    };
  },

  listAll(): Order[] {
    return Array.from(Database.orders.values());
  },
};
