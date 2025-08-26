import { MockService } from '../interfaces/testing.interface';

export class ServiceMockFactory {
  static createUserService(): MockService {
    const mock = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    };

    return {
      mock: mock as any,
      reset: () => jest.clearAllMocks(),
      restore: () => jest.restoreAllMocks(),
    };
  }

  static createCacheService(): MockService {
    const mock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn(),
    };

    return {
      mock: mock as any,
      reset: () => jest.clearAllMocks(),
      restore: () => jest.restoreAllMocks(),
    };
  }

  static createEventBusService(): MockService {
    const mock = {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      publish: jest.fn(),
      subscribe: jest.fn(),
    };

    return {
      mock: mock as any,
      reset: () => jest.clearAllMocks(),
      restore: () => jest.restoreAllMocks(),
    };
  }
}