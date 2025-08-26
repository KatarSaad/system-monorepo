import { TestFixture } from '../interfaces/testing.interface';

export class UserFixture implements TestFixture {
  create(overrides = {}) {
    return {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  createMany(count: number, overrides = {}) {
    return Array.from({ length: count }, (_, i) =>
      this.create({ ...overrides, id: `user-${i}`, email: `user${i}@example.com` })
    );
  }
}

export class OrderFixture implements TestFixture {
  create(overrides = {}) {
    return {
      id: '456e7890-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      total: 100.00,
      status: 'pending',
      items: [],
      createdAt: new Date(),
      ...overrides,
    };
  }

  createMany(count: number, overrides = {}) {
    return Array.from({ length: count }, (_, i) =>
      this.create({ ...overrides, id: `order-${i}` })
    );
  }
}

export const fixtures = {
  user: new UserFixture(),
  order: new OrderFixture(),
};