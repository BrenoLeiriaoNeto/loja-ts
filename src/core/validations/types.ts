import type { DomainError } from '../errors';

export type Result<T, E extends DomainError = DomainError> =
  { readonly success: true; readonly data: T } | { readonly success: false; readonly error: E };
