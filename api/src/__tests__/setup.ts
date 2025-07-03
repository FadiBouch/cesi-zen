import { jest } from '@jest/globals';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_EXPIRES_IN = '3600';
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  jest.clearAllMocks();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Setup', () => {
  it('should initialize test environment', () => {
    expect(process.env.JWT_SECRET).toBe('test-secret-key');
  });
});