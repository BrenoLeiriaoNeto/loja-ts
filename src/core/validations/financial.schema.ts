import { ValidationError } from '../errors';
import type { Financial } from '../interfaces/financial';
import type { Order } from '../interfaces/order';
import { isObject } from '../utils/type-guards';
import type { Result } from './types';

export type CreateFinancialDTO = Omit<Financial, 'id' | 'createdAt' | 'updatedAt'>;

function isOrderEntity(value: unknown): value is Order {
  return isObject(value) && typeof value.id === 'string' && Array.isArray(value.items);
}

export const FinancialSchema = {
  parse(input: unknown): Result<CreateFinancialDTO, ValidationError> {
    const errors: string[] = [];

    if (!isObject(input)) {
      return {
        success: false,
        error: new ValidationError(['O payload deve ser um objeto válido.']),
      };
    }

    const data = input;

    const parsedOrders: Order[] = [];
    let parsedTotalRevenue = 0;
    let parsedDateOfReport: Date = new Date();
    let parsedResponsiblePerson = '';

    if (!Array.isArray(data.orders)) {
      errors.push('O campo "orders" deve ser um array de pedidos e é obrigatório.');
    } else {
      for (let i = 0; i < data.orders.length; i++) {
        const order = data.orders[i];

        if (!isOrderEntity(order)) {
          errors.push(`O pedido na posição [${i}] deve ser válido.`);
          continue;
        }

        parsedOrders.push(order);
      }
    }

    if (
      typeof data.totalRevenue !== 'number' ||
      isNaN(data.totalRevenue) ||
      data.totalRevenue < 0
    ) {
      errors.push('O campo "totalRevenue" deve ser um número válido e positivo.');
    } else {
      parsedTotalRevenue = data.totalRevenue;
    }

    if (data.dateOfReport instanceof Date && !isNaN(data.dateOfReport.getTime())) {
      parsedDateOfReport = data.dateOfReport;
    } else if (typeof data.dateOfReport === 'string') {
      const parsedDate = new Date(data.dateOfReport);

      if (!isNaN(parsedDate.getTime())) {
        errors.push('O campo "dateOfReport" deve ser uma data válida.');
      } else {
        parsedDateOfReport = parsedDate;
      }
    } else {
      errors.push('O campo "dateOfReport" deve ser um objeto Date ou uma string ISO válida.');
    }

    if (typeof data.responsiblePerson !== 'string' || data.responsiblePerson.trim().length === 0) {
      errors.push('O campo "responsiblePerson" deve ser uma string e é obrigatório.');
    } else {
      parsedResponsiblePerson = data.responsiblePerson.trim();
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
        orders: parsedOrders,
        totalRevenue: parsedTotalRevenue,
        dateOfReport: parsedDateOfReport,
        responsiblePerson: parsedResponsiblePerson,
      },
    };
  },
};
