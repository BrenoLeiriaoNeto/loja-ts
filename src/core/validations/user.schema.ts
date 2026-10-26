import { ValidationError } from '../errors';
import type { User } from '../interfaces/user';
import type { ValidationResult } from './types';

export type CreateUserDTO = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

export const UserSchema = {
  parse(input: unknown): ValidationResult<CreateUserDTO> {
    const errors: string[] = [];

    if (!input || typeof input !== 'object') {
      return {
        success: false,
        error: new ValidationError(['O payload deve ser um objeto válido.']),
      };
    }

    const data = input as Record<string, unknown>;

    let parsedName = '';
    let parsedEmail = '';

    if (typeof data.name !== 'string' || data.name.trim().length < 3) {
      errors.push('O campo "nome" deve ser uma string com pelo menos 3 caractéres.');
    } else {
      parsedName = data.name.trim();
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof data.email !== 'string' || !emailRegex.test(data.email)) {
      errors.push('O campo "email" deve ser um email válido.');
    } else {
      parsedEmail = data.email.trim();
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
        email: parsedEmail,
      },
    };
  },
};
