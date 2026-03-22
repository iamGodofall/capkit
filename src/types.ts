export interface Capability {
  payload: CapabilityPayload;
  signature: string;
}

export interface CapabilityPayload {
  id: string;
  action: string;
  resource: string;
  conditions?: Record<string, any>;
  issuedAt: number;
  expiresAt: number;
  nonce?: string;
}

export interface IssueOptions {
  action: string;
  resource: string;
  key: string | Buffer;
  expiresIn: string;
  conditions?: Record<string, any>;
}

export interface VerifyOptions {
  capability: Capability | string;
  key: string | Buffer;
}

export interface VerificationResult {
  valid: boolean;
  reason?: string;
  parsed?: CapabilityPayload;
}

export interface PolicyRule {
  action: string;
  resource?: string;
  allow: boolean;
  conditions?: Record<string, any>;
  reason?: string;
}

export interface Policy {
  version?: string;
  rules: PolicyRule[];
}

export interface PolicyCheckOptions {
  policy: Policy;
  action: string;
  resource?: string;
  conditions?: Record<string, any>;
}

export interface PolicyDecision {
  allowed: boolean;
  reason?: string;
  conditions?: Record<string, any>;
}
