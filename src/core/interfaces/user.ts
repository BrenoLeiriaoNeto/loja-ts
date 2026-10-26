import { UserId } from '../types/base';
import { BaseEntity } from './base';

export interface User extends BaseEntity<UserId> {
  name: string;
  email: string;
}
