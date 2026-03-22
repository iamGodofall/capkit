import { issueCapability, verifyCapability, logAction } from '../src/capability';

const SECRET_KEY = 'test-key-123';

describe('Capability', () => {
  test('should issue and verify capability', () => {
    const cap = issueCapability({
      action: 'post',
      resource: '/test',
      key: SECRET_KEY,
      expiresIn: '1h'
    });

    expect(cap.payload.action).toBe('post');
    expect(cap.payload.resource).toBe('/test');
    expect(cap.payload.id).toMatch(/^cap_/);
    expect(cap.payload.expiresAt).toBeGreaterThan(Date.now());

    const result = verifyCapability({ capability: cap, key: SECRET_KEY });
    expect(result.valid).toBe(true);
    expect(result.parsed).toBeDefined();
  });

  test('should reject expired capability', () => {
    const cap = issueCapability({
      action: 'post',
      resource: '/test',
      key: SECRET_KEY,
      expiresIn: '1s'
    });

    // Force expiration
    cap.payload.expiresAt = Date.now() - 1000;
    
    const result = verifyCapability({ capability: cap, key: SECRET_KEY });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('expired');
  });

  test('should reject invalid signature', () => {
    const cap = issueCapability({
      action: 'post',
      resource: '/test',
      key: SECRET_KEY,
      expiresIn: '1h'
    });

    const result = verifyCapability({ capability: cap, key: 'wrong-key' });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Invalid signature');
  });

  test('should reject tampered payload', () => {
    const cap = issueCapability({
      action: 'post',
      resource: '/test',
      key: SECRET_KEY,
      expiresIn: '1h'
    });

    // Tamper with payload
    const tampered = JSON.parse(JSON.stringify(cap));
    tampered.payload.action = 'delete';

    const result = verifyCapability({ capability: tampered, key: SECRET_KEY });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Invalid signature');
  });

  test('should log action with audit receipt', () => {
    const cap = issueCapability({
      action: 'post',
      resource: '/twitter',
      key: SECRET_KEY,
      expiresIn: '1h'
    });

    const receipt = logAction({
      capability: cap,
      performedBy: 'test-agent',
      details: { content: 'test' },
      key: SECRET_KEY
    });

    expect(receipt.receipt).toBeDefined();
    expect(receipt.receipt.length).toBeGreaterThan(0);
  });
});
