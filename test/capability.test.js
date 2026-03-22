"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const capability_1 = require("../src/capability");
const SECRET_KEY = 'test-key-123';
describe('Capability', () => {
    test('should issue and verify capability', () => {
        const cap = (0, capability_1.issueCapability)({
            action: 'post',
            resource: '/test',
            key: SECRET_KEY,
            expiresIn: '1h'
        });
        expect(cap.payload.action).toBe('post');
        expect(cap.payload.resource).toBe('/test');
        expect(cap.payload.id).toMatch(/^cap_/);
        expect(cap.payload.expiresAt).toBeGreaterThan(Date.now());
        const result = (0, capability_1.verifyCapability)({ capability: cap, key: SECRET_KEY });
        expect(result.valid).toBe(true);
        expect(result.parsed).toBeDefined();
    });
    test('should reject expired capability', () => {
        const cap = (0, capability_1.issueCapability)({
            action: 'post',
            resource: '/test',
            key: SECRET_KEY,
            expiresIn: '1s'
        });
        // Force expiration
        cap.payload.expiresAt = Date.now() - 1000;
        const result = (0, capability_1.verifyCapability)({ capability: cap, key: SECRET_KEY });
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('expired');
    });
    test('should reject invalid signature', () => {
        const cap = (0, capability_1.issueCapability)({
            action: 'post',
            resource: '/test',
            key: SECRET_KEY,
            expiresIn: '1h'
        });
        const result = (0, capability_1.verifyCapability)({ capability: cap, key: 'wrong-key' });
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Invalid signature');
    });
    test('should reject tampered payload', () => {
        const cap = (0, capability_1.issueCapability)({
            action: 'post',
            resource: '/test',
            key: SECRET_KEY,
            expiresIn: '1h'
        });
        // Tamper with payload
        const tampered = JSON.parse(JSON.stringify(cap));
        tampered.payload.action = 'delete';
        const result = (0, capability_1.verifyCapability)({ capability: tampered, key: SECRET_KEY });
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Invalid signature');
    });
    test('should log action with audit receipt', () => {
        const cap = (0, capability_1.issueCapability)({
            action: 'post',
            resource: '/twitter',
            key: SECRET_KEY,
            expiresIn: '1h'
        });
        const receipt = (0, capability_1.logAction)({
            capability: cap,
            performedBy: 'test-agent',
            details: { content: 'test' },
            key: SECRET_KEY
        });
        expect(receipt.receipt).toBeDefined();
        expect(receipt.receipt.length).toBeGreaterThan(0);
    });
});
//# sourceMappingURL=capability.test.js.map