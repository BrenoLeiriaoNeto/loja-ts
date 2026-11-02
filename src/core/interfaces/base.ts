export interface BaseEntity<T> {
  readonly id: T;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
