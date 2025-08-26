// Legacy exports (deprecated)
export const TestFactory = {
  createUser(overrides: Partial<{ email: string }> = {}) {
    const email = overrides.email ?? `user_${Math.random().toString(36).slice(2)}@example.com`;
    return { email } as any;
  }
};

export class IntegrationTestBase {
  async setup(): Promise<void> {}
}

// Module
export * from './testing.module';

// Interfaces
export * from './interfaces/testing.interface';

// Mocks
export * from './mocks/service.mocks';

// Fixtures
export * from './fixtures/data.fixtures';

// Utils
export * from './utils/test.utils';