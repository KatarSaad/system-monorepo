export interface TestConfig {
  database?: {
    provider: 'memory' | 'sqlite' | 'postgresql';
    url?: string;
  };
  cache?: {
    provider: 'memory' | 'redis';
    url?: string;
  };
  timeout?: number;
}

export interface MockService<T = any> {
  mock: jest.MockedObject<T>;
  reset(): void;
  restore(): void;
}

export interface TestFixture<T = any> {
  create(overrides?: Partial<T>): T;
  createMany(count: number, overrides?: Partial<T>): T[];
}

export interface AssertionHelper {
  expectValidUuid(value: string): void;
  expectValidDate(value: string | Date): void;
  expectValidEmail(value: string): void;
}

export interface TestContext {
  config: TestConfig;
  mocks: Map<string, MockService>;
  fixtures: Map<string, TestFixture>;
  helpers: AssertionHelper;
}