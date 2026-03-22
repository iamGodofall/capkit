/**
 * Policy rule structure
 */
export interface PolicyRule {
    action: string;
    resource: string;
    conditions?: Record<string, any>;
    maxUses?: number;
}
/**
 * Loaded policy
 */
export interface Policy {
    version: string;
    rules: PolicyRule[];
}
/**
 * Policy check result
 */
export interface PolicyCheckResult {
    allowed: boolean;
    reason?: string;
}
/**
 * Options for policy check
 */
export interface CheckPolicyOptions {
    action: string;
    resource: string;
    conditions?: Record<string, any>;
    policy: Policy;
}
/**
 * Loads policy from YAML file
 *
 * @param path - Path to YAML policy file
 * @returns Loaded policy
 * @throws Error if invalid YAML or policy structure
 */
export declare function loadPolicy(path: string): Policy;
/**
 * Checks if action is allowed by policy
 *
 * @param options - Policy check options
 * @returns Policy check result
 */
export declare function checkPolicy(options: CheckPolicyOptions): PolicyCheckResult;
//# sourceMappingURL=policy.d.ts.map