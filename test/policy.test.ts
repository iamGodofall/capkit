import { loadPolicy, checkPolicy } from '../src/index';
import * as fs from 'fs';
import * as path from 'path';

const policyPath = path.join(__dirname, '../demo/policy.yaml');

describe('Policy', () => {
  let policy: any;

  beforeAll(() => {
    // Create test policy file
    fs.writeFileSync(policyPath, `
version: "1.0"
rules:
  - action: "post"
    resource: "/twitter"
    conditions:
      maxContentLength: 280
  - action: "read" 
    resource: "/user/profile"
`);
    policy = loadPolicy(policyPath);
  });

  afterAll(() => {
    fs.unlinkSync(policyPath);
  });

  test('should load policy correctly', () => {
    expect(policy.version).toBe('1.0');
    expect(Array.isArray(policy.rules)).toBe(true);
    expect(policy.rules.length).toBe(2);
  });

  test('should allow permitted action/resource', () => {
    const result = checkPolicy({
      action: 'post',
      resource: '/twitter',
      conditions: {},
      policy
    });
    expect(result.allowed).toBe(true);
  });

  test('should deny unknown action/resource', () => {
    const result = checkPolicy({
      action: 'delete',
      resource: '/anything',
      policy
    });
    expect(result.allowed).toBe(false);
  });

  test('should enforce conditions', () => {
    const result = checkPolicy({
      action: 'post',
      resource: '/twitter',
      conditions: { maxContentLength: 300 }, // Too long
      policy
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Condition failed');
  });

  test('should handle missing policy file', () => {
    expect(() => loadPolicy('nonexistent.yaml')).toThrow('Failed to load policy');
  });
});
