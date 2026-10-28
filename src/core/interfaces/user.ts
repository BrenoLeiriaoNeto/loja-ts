import type { UserId } from '../types/base';
import type { BaseEntity } from './base';

export interface User extends BaseEntity<UserId> {
  name: string;
  email: string;
}
