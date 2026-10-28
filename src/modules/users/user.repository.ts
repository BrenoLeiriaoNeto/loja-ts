import { NotFoundError, ValidationError } from '@/core/errors';
import { User } from '@/core/interfaces/user';
import type { UserId } from '@/core/types/base';
import type { Result } from '@/core/validations/types';
import { UserSchema } from '@/core/validations/user.schema';
import { Database } from '@/storage/memory-db';

export const UserRepository = {
  create(input: unknown): Result<User, ValidationError> {
    const result = UserSchema.parse(input);

    if (!result.success) {
      return result;
    }

    const now = new Date();
    const newId = crypto.randomUUID() as UserId;

    const newUser = {
      id: newId,
      name: result.data.name,
      email: result.data.email,
      createdAt: now,
      updatedAt: now,
    };

    Database.users.set(newId, newUser);

    return {
      success: true as const,
      data: newUser,
    };
  },

  findById(id: string): Result<User, NotFoundError> {
    const user = Database.users.get(id as UserId);

    if (!user) {
      return {
        success: false as const,
        error: new NotFoundError('User', id),
      };
    }

    return {
      success: true as const,
      data: user,
    };
  },

  listAll(): User[] {
    return Array.from(Database.users.values());
  },
};
