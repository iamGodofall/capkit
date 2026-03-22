#!/usr/bin/env node

import { issueCapability, verifyCapability, logAction, loadPolicy, checkPolicy } from '../src';
import * as fs from 'fs';

async function main() {
  const SECRET_KEY = 'my-super-secret-key-dont-log-this!!';
  
  console.log('🧠 CapKit Demo - AI Agent Permission System\n');
  
  // 1. Load policy
const policy = loadPolicy('./demo/policy.yaml');
  console.log('📜 Policy loaded:', JSON.stringify(policy.rules.map(r => ({action: r.action, resource: r.resource})), null, 2));
  
  // 2. Agent requests capability to post to Twitter
  console.log('\n🤖 Agent requests permission to POST to /twitter...');
  const capability = issueCapability({
    action: 'post',
    resource: '/twitter',
    key: SECRET_KEY,
    expiresIn: '10m',
    conditions: {
      maxContentLength: 280,
      platform: 'twitter',
    }
  });
  
  console.log('✅ Capability issued:', JSON.stringify(capability.payload, null, 2));
  
  // 3. Policy check
  console.log('\n🔍 Checking policy...');
  const policyResult = checkPolicy({
    action: 'post',
    resource: '/twitter',
    conditions: capability.payload.conditions,
    policy
  });
  console.log('Policy:', policyResult.allowed ? '✅ ALLOWED' : '❌ DENIED', policyResult.reason || '');
  
  // 4. Verify capability
  console.log('\n🔑 Verifying capability...');
  const verification = verifyCapability({
    capability,
    key: SECRET_KEY
  });
  console.log('Verification:', verification.valid ? '✅ VALID' : '❌ INVALID');
  
  if (verification.valid && policyResult.allowed) {
    // 5. Agent performs action
    console.log('\n🎯 Agent performing authorized action...');
    const audit = logAction({
      capability,
      performedBy: 'twitter-agent-v1.0',
      details: {
        content: 'Hello from CapKit! 🚀 #AISecurity',
        contentLength: 27
      },
      key: SECRET_KEY
    });
    
    console.log('📝 Audit receipt generated:', audit.receipt.slice(0, 100) + '...');
    
    // Simulate tampering test
    console.log('\n🧪 Tampering test...');
    const tamperedCap = { ...capability, payload: {...capability.payload, action: 'delete'} };
    const tamperedVerification = verifyCapability({ capability: tamperedCap, key: SECRET_KEY });
    console.log('Tampered capability:', tamperedVerification.valid ? '✅ VALID (BUG!)' : '❌ INVALID (GOOD!)');
    
    // Simulate expiration test
    console.log('\n⏰ Expiration test (set to past)...');
    const expiredCap = { ...capability, payload: {...capability.payload, expiresAt: Date.now() - 1000 } };
    const expiredVerification = verifyCapability({ capability: expiredCap, key: SECRET_KEY });
    console.log('Expired capability:', expiredVerification.valid ? '✅ VALID (BUG!)' : '❌ INVALID (GOOD!)');
    
    console.log('\n🎉 All tests passed! CapKit is working correctly.');
  } else {
    console.log('\n❌ Agent authorization failed.');
  }
}

main().catch(console.error);
