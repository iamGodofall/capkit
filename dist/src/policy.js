"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPolicy = loadPolicy;
exports.checkPolicy = checkPolicy;
const yaml = __importStar(require("js-yaml"));
const fs = __importStar(require("fs"));
/**
 * Loads policy from YAML file
 *
 * @param path - Path to YAML policy file
 * @returns Loaded policy
 * @throws Error if invalid YAML or policy structure
 */
function loadPolicy(path) {
    try {
        const file = fs.readFileSync(path, 'utf8');
        const policy = yaml.load(file);
        if (!policy.version || !Array.isArray(policy.rules)) {
            throw new Error('Invalid policy structure: missing version or rules');
        }
        return policy;
    }
    catch (error) {
        throw new Error(`Failed to load policy: ${error}`);
    }
}
/**
 * Checks if action is allowed by policy
 *
 * @param options - Policy check options
 * @returns Policy check result
 */
function checkPolicy(options) {
    let context = options.context || options.conditions || {};
    const { policy, action, resource } = options;
    // Find exact match first (action + resource)
    let rule = policy.rules?.find(r => r.action === action &&
        (!r.resource || r.resource === resource));
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
