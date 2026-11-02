import { NotFoundError, ValidationError } from '@/core/errors';
import type { Order } from '@/core/interfaces/order';
import type { Product } from '@/core/interfaces/product';
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
        success: false,
        error: new NotFoundError('User', userId),
      };
    }

    const domainErrors: string[] = [];
    let calculatedTotalPrice = 0;

    const pendingStockUpdates: Array<{ product: Product; newStock: number }> = [];

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
          `Produto '${product.name}' não está disponível para venda. Status atual: ${product.status}.`,
        );
      }

      if (item.unitPrice !== product.price) {
        domainErrors.push(
          `Preço unitário divergente no item [${i}]. Informado: R$ ${item.unitPrice}, Catálogo: R$ ${product.price}.`,
        );
      }

      calculatedTotalPrice += product.price * item.quantity;
      const newStock = product.stockQuantity - item.quantity;

      if (newStock < 0) {
        domainErrors.push(
          `Estoque insuficiente para o produto '${product.name}'. Estoque atual: ${product.stockQuantity}, Quantidade solicitada: ${item.quantity}.`,
        );
      } else {
        pendingStockUpdates.push({ product, newStock });
      }
    }

    if (totalPrice !== calculatedTotalPrice) {
      domainErrors.push(
        `Preço total do pedido divergente. Informado: R$ ${totalPrice}, Calculado pelo catálogo: R$ ${calculatedTotalPrice}.`,
      );
    }

    if (domainErrors.length > 0) {
      return {
        success: false,
        error: new ValidationError(domainErrors),
      };
    }

    const now = new Date();

    for (let i = 0; i < pendingStockUpdates.length; i++) {
      const update = pendingStockUpdates[i];
      if (!update) continue;

      const { product, newStock } = update;

      const updatedProduct: Product = {
        ...product,
        stockQuantity: newStock,
        status: newStock === 0 ? 'out_of_stock' : product.status,
        updatedAt: now,
      };

      Database.products.set(product.id, updatedProduct);
    }

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
      success: true,
      data: newOrder,
    };
  },

  findById(id: string): Result<Order, NotFoundError> {
    const order = Database.orders.get(toOrderId(id));

    if (!order) {
      return {
        success: false,
        error: new NotFoundError('Order', id),
      };
    }

    return {
      success: true,
      data: order,
    };
  },

  findByUser(name: string): Result<Order[], NotFoundError> {
    const searchTerm = name.trim().toLowerCase();

    if (searchTerm.length === 0) {
      return {
        success: false,
        error: new NotFoundError('Order', 'termo de busca vazio'),
      };
    }

    const matchingUserIds = new Set(
      Array.from(Database.users.values())
        .filter((user) => user.name.toLowerCase().includes(searchTerm))
        .map((u) => u.id),
    );

    if (matchingUserIds.size === 0) {
      return {
        success: false,
        error: new NotFoundError('User', name),
      };
    }

    const matchedOrders = Array.from(Database.orders.values()).filter((order) =>
      matchingUserIds.has(order.userId),
    );

    if (matchedOrders.length === 0) {
      return {
        success: false,
        error: new NotFoundError('Order', `pedidos para o usuário '${name}'`),
      };
    }

    return {
      success: true,
      data: matchedOrders,
    };
  },

  listAll(): Order[] {
    return Array.from(Database.orders.values());
  },
};
