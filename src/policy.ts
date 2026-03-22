import * as yaml from 'js-yaml';
import * as fs from 'fs';

/**
 * Policy rule structure
 */
export interface PolicyRule {
  action: string;
  resource?: string;
  allow?: boolean;
  reason?: string;
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
  conditions?: Record<string, any>;
}

/**
 * Options for policy check
 */
export interface CheckPolicyOptions {
  action: string;
  resource?: string;
  conditions?: Record<string, any>;
  context?: Record<string, any>;
  policy: Policy;
}

/**
 * Loads policy from YAML file
 * 
 * @param path - Path to YAML policy file
 * @returns Loaded policy
 * @throws Error if invalid YAML or policy structure
 */
export function loadPolicy(path: string): Policy {
  try {
    const file = fs.readFileSync(path, 'utf8');
    const policy = yaml.load(file) as any;
    
    if (!policy.version || !Array.isArray(policy.rules)) {
      throw new Error('Invalid policy structure: missing version or rules');
    }

    return policy as Policy;
  } catch (error) {
    throw new Error(`Failed to load policy: ${error}`);
  }
}

/**
 * Checks if action is allowed by policy
 * 
 * @param options - Policy check options
 * @returns Policy check result
 */
export function checkPolicy(options: CheckPolicyOptions): PolicyCheckResult {
  let context = options.context || options.conditions || {};
  const { policy, action, resource } = options;

  // Find exact match first (action + resource)
  let rule = policy.rules?.find(r => 
    r.action === action && 
    (!r.resource || r.resource === resource)
  );
  
  // Fallback: action-only match
  if (!rule) {
    rule = policy.rules?.find(r => r.action === action);
  }
  
  // No matching rule = deny (secure by default)
  if (!rule) {
    return { allowed: false, reason: 'no_matching_rule' };
  }
  
  // Explicit deny
  if (rule.allow === false) {
    return { allowed: false, reason: rule.reason || 'explicitly_denied' };
  }
  
  // Check platform condition
  if (rule.conditions?.allowedPlatforms && context.platform) {
    if (!rule.conditions.allowedPlatforms.includes(context.platform)) {
      return { allowed: false, reason: `platform ${context.platform} not allowed` };
    }
  }
  
  // Check maxContentLength condition
  if (rule.conditions?.maxContentLength && context.maxContentLength && context.maxContentLength > rule.conditions.maxContentLength) {
    return { allowed: false, reason: 'Condition failed: content too long' };
  }
  
  return { allowed: true, conditions: rule.conditions };
}
