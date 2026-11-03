/* oxlint-disable typescript/no-unsafe-type-assertion -- 
    Este arquivo é o limite oficial (boundary) do sistema para a criação de Branded Types.
    Como os IDs nominais existem apenas em tempo de compilação, o casting com `as` é estritamente
    necessário aqui para converter strings primitivas, concentrando essa exceção de tipagem em um
    único ponto centralizado e controlado.
*/
import type { FinancialId, OrderId, ProductId, UserId } from '../types/base';

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const toUserId = (id: string): UserId => id as unknown as UserId;
export const toProductId = (id: string): ProductId => id as unknown as ProductId;
export const toOrderId = (id: string): OrderId => id as unknown as OrderId;
export const toFinancialId = (id: string): FinancialId => id as unknown as FinancialId;
