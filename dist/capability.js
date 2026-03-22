"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueCapability = issueCapability;
exports.verifyCapability = verifyCapability;
exports.logAction = logAction;
const crypto_1 = require("crypto");
/**
 * Issues a cryptographically signed capability token
 *
 * @param options - Issuance options
 * @returns Signed capability
 * @throws Error if invalid options
 */
function issueCapability(options) {
    if (!options.action || !options.resource || !options.key) {
        throw new Error('Missing required fields: action, resource, key');
    }
    const now = Date.now();
    const expiresInMs = parseDuration(options.expiresIn);
    if (expiresInMs <= 0) {
        throw new Error('Invalid expiresIn duration');
    }
    const id = `cap_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const payload = {
        id,
        action: options.action,
        resource: options.resource,
        conditions: options.conditions || {},
        issuedAt: now,
        expiresAt: now + expiresInMs,
    };
    const payloadString = JSON.stringify(payload);
    const key = typeof options.key === 'string' ? Buffer.from(options.key) : options.key;
    const hmac = (0, crypto_1.createHmac)('sha256', key);
    const signature = hmac.update(payloadString).digest('hex');
    return {
        payload,
        signature,
    };
}
/**
 * Verifies a capability token
 *
 * @param options - Verification options
 * @returns Verification result
 */
function verifyCapability(options) {
    let capability;
    if (typeof options.capability === 'string') {
        try {
            capability = JSON.parse(options.capability);
        }
        catch {
            return { valid: false, reason: 'Invalid capability format' };
        }
    }
    else {
        capability = options.capability;
    }
    const now = Date.now();
    if (now > capability.payload.expiresAt) {
        return { valid: false, reason: 'Capability expired' };
    }
    const key = typeof options.key === 'string' ? Buffer.from(options.key) : options.key;
    const payloadString = JSON.stringify(capability.payload);
    const expectedSignature = (0, crypto_1.createHmac)('sha256', key)
        .update(payloadString)
        .digest('hex');
    if (!(0, crypto_1.timingSafeEqual)(Buffer.from(capability.signature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
        return { valid: false, reason: 'Invalid signature' };
    }
    return {
        valid: true,
        parsed: capability.payload,
    };
}
function logAction(options) {
    const audit = {
        capabilityId: options.capability.payload.id,
        action: options.capability.payload.action,
        resource: options.capability.payload.resource,
        performedBy: options.performedBy,
        timestamp: Date.now(),
        details: options.details || {},
    };
    const auditString = JSON.stringify(audit);
    const key = typeof options.key === 'string' ? Buffer.from(options.key) : options.key;
    const signature = (0, crypto_1.createHmac)('sha256', key).update(auditString).digest('hex');
    const receipt = JSON.stringify({
        audit,
        signature,
    });
    return { receipt };
}
// Helpers
function parseDuration(duration) {
    const units = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };
    const match = duration.match(/^([0-9]+)([smhd])$/i);
    if (!match)
        return -1;
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    return value * (units[unit] || 0);
}
//# sourceMappingURL=capability.js.map