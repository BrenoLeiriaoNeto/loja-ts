import { NotFoundError, ValidationError } from '@/core/errors';
import type { Financial } from '@/core/interfaces/financial';
import { toFinancialId, toOrderId } from '@/core/utils/type-guards';
import { FinancialSchema } from '@/core/validations/financial.schema';
import type { Result } from '@/core/validations/types';
import { Database } from '@/storage/memory-db';

export const FinancialRepository = {
  create(input: unknown): Result<Financial, ValidationError | NotFoundError> {
    const result = FinancialSchema.parse(input);

    if (!result.success) {
      return result;
    }

    const { orders, totalRevenue, dateOfReport, responsiblePerson } = result.data;

    const domainErrors: string[] = [];
    let calculatedRevenue = 0;

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      if (!order) continue;

      const existingOrder = Database.orders.get(toOrderId(order.id));

      if (!existingOrder) {
        domainErrors.push(`O pedido com ID '${order.id}' na posição [${i}] não foi encontrado.`);
        continue;
      }

      calculatedRevenue += existingOrder.totalPrice;
    }

    if (totalRevenue !== calculatedRevenue) {
      domainErrors.push(
        `A receita total do relatório financeiro está divergente. Informado: R$ ${totalRevenue}, Calculado pelos pedidos: R$ ${calculatedRevenue}.`,
      );
    }

    if (domainErrors.length > 0) {
      return {
        success: false as const,
        error: new ValidationError(domainErrors),
      };
    }

    const now = new Date();
    const newId = toFinancialId(crypto.randomUUID());

    const newFinancial: Financial = {
      id: newId,
      orders,
      totalRevenue: calculatedRevenue,
      dateOfReport,
      responsiblePerson,
      createdAt: now,
      updatedAt: now,
    };

    Database.financials.set(newId, newFinancial);

    return {
      success: true as const,
      data: newFinancial,
    };
  },

  findById(id: string): Result<Financial, NotFoundError> {
    const financial = Database.financials.get(toFinancialId(id));

    if (!financial) {
      return {
        success: false as const,
        error: new NotFoundError('Financial', id),
      };
    }

    return {
      success: true as const,
      data: financial,
    };
  },

  listAll(): Financial[] {
    return Array.from(Database.financials.values());
  },
};
