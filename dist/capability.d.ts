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
    expiresIn: string;
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
export declare function issueCapability(options: IssueOptions): Capability;
/**
 * Verifies a capability token
 *
 * @param options - Verification options
 * @returns Verification result
 */
export declare function verifyCapability(options: VerifyOptions): VerificationResult;
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
export declare function logAction(options: LogActionOptions): AuditReceipt;
//# sourceMappingURL=capability.d.ts.map