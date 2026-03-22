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
const index_1 = require("../src/index");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const policyPath = path.join(__dirname, '../demo/policy.yaml');
describe('Policy', () => {
    let policy;
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
        policy = (0, index_1.loadPolicy)(policyPath);
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
        const result = (0, index_1.checkPolicy)({
            action: 'post',
            resource: '/twitter',
            conditions: {},
            policy
        });
        expect(result.allowed).toBe(true);
    });
    test('should deny unknown action/resource', () => {
        const result = (0, index_1.checkPolicy)({
            action: 'delete',
            resource: '/anything',
            policy
        });
        expect(result.allowed).toBe(false);
    });
    test('should enforce conditions', () => {
        const result = (0, index_1.checkPolicy)({
            action: 'post',
            resource: '/twitter',
            conditions: { maxContentLength: 300 }, // Too long
            policy
        });
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('Condition failed');
    });
    test('should handle missing policy file', () => {
        expect(() => (0, index_1.loadPolicy)('nonexistent.yaml')).toThrow('Failed to load policy');
    });
});
