export interface BaseEntity<T> {
  readonly id: T;
  readonly createdAt: Date;
  updatedAt: Date;
}
