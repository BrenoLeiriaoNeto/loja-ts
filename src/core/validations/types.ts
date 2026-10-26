import { ValidationError } from '../errors';

export type ValidationResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: ValidationError };
