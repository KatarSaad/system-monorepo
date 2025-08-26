import { TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TestConfig, AssertionHelper } from '../interfaces/testing.interface';

export class TestUtils {
  static async setupTestApp(module: TestingModule): Promise<INestApplication> {
    const app = module.createNestApplication();
    await app.init();
    return app;
  }

  static async cleanupTestApp(app: INestApplication): Promise<void> {
    if (app) {
      await app.close();
    }
  }

  static createTestConfig(overrides: Partial<TestConfig> = {}): TestConfig {
    return {
      database: { provider: 'memory' },
      cache: { provider: 'memory' },
      timeout: 5000,
      ...overrides,
    };
  }

  static async waitFor(condition: () => boolean | Promise<boolean>, timeout = 5000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  }
}

export const assertionHelpers: AssertionHelper = {
  expectValidUuid(value: string): void {
    expect(value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  },

  expectValidDate(value: string | Date): void {
    const date = new Date(value);
    expect(date).toBeInstanceOf(Date);
    expect(date.getTime()).not.toBeNaN();
  },

  expectValidEmail(value: string): void {
    expect(value).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  },
};