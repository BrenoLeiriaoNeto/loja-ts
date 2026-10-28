import type { ValidationError } from '@/core/errors';
import { NotFoundError } from '@/core/errors';
import type { User } from '@/core/interfaces/user';
import { toUserId } from '@/core/utils/type-guards';
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
    const newId = toUserId(crypto.randomUUID());

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
    const user = Database.users.get(toUserId(id));

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
