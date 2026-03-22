import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Capability payload structure
 */
export interface CapabilityPayload {
  id: string;
  action: string;
  resource: string;
  conditions?: Record<string, any>;
  issuedAt: number;
  expiresAt: number;
  nonce?: string;
}

/**
 * Signed capability token
 */
export interface Capability {
  payload: CapabilityPayload;
  signature: string;
}

/**
 * Verification result
 */
export interface VerificationResult {
  valid: boolean;
  reason?: string;
  parsed?: CapabilityPayload;
}

/**
 * Options for issuing capability
 */
export interface IssueOptions {
  action: string;
  resource: string;
  key: string | Buffer;
  expiresIn: string; // e.g. '10m', '1h'
  conditions?: Record<string, any>;
}

/**
 * Options for verifying capability
 */
export interface VerifyOptions {
  capability: Capability | string;
  key: string | Buffer;
}

/**
 * Issues a cryptographically signed capability token
 * 
 * @param options - Issuance options
 * @returns Signed capability
 * @throws Error if invalid options
 */
export function issueCapability(options: IssueOptions): Capability {
  if (!options.action || !options.resource || !options.key) {
    throw new Error('Missing required fields: action, resource, key');
  }

  const now = Date.now();
  const expiresInMs = parseDuration(options.expiresIn);
  if (expiresInMs <= 0) {
    throw new Error('Invalid expiresIn duration');
  }

  const id = `cap_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  
  const payload: CapabilityPayload = {
    id,
    action: options.action,
    resource: options.resource,
    conditions: options.conditions || {},
    issuedAt: now,
    expiresAt: now + expiresInMs,
  };

  const payloadString = JSON.stringify(payload);
  const key = typeof options.key === 'string' ? Buffer.from(options.key) : options.key;
  const hmac = createHmac('sha256', key);
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
export function verifyCapability(options: VerifyOptions): VerificationResult {
  let capability: Capability;
  
  if (typeof options.capability === 'string') {
    try {
      capability = JSON.parse(options.capability) as Capability;
    } catch {
      return { valid: false, reason: 'Invalid capability format' };
    }
  } else {
    capability = options.capability;
  }

  const now = Date.now();
  if (now > capability.payload.expiresAt) {
    return { valid: false, reason: 'Capability expired' };
  }

  const key = typeof options.key === 'string' ? Buffer.from(options.key) : options.key;
  const payloadString = JSON.stringify(capability.payload);
  
  const expectedSignature = createHmac('sha256', key)
    .update(payloadString)
    .digest('hex');

  if (!timingSafeEqual(
    Buffer.from(capability.signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )) {
    return { valid: false, reason: 'Invalid signature' };
  }

  return {
    valid: true,
    parsed: capability.payload,
  };
}

/**
 * Logs an action with signed audit receipt
 */
export interface LogActionOptions {
  capability: Capability;
  performedBy: string;
  details?: Record<string, any>;
  key: string | Buffer;
}

export interface AuditReceipt {
  receipt: string;
}

export function logAction(options: LogActionOptions): AuditReceipt {
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
  const signature = createHmac('sha256', key).update(auditString).digest('hex');

  const receipt = JSON.stringify({
    audit,
    signature,
  });

  return { receipt };
}

// Helpers
function parseDuration(duration: string): number {
  const units: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const match = duration.match(/^([0-9]+)([smhd])$/i);
  if (!match) return -1;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  return value * (units[unit] || 0);
}
