# CapKit - Capability Kit for AI Agents

Give your AI agents **the minimum permission they need**. No more, no less.

## 🚀 Quick Start (5 minutes)

```bash
git clone https://github.com/iamGodofall/capkit.git
cd capkit
npm install
npm run demo  # See it work!
```

## Why CapKit?

Current AI agents have **root access** to your systems. One prompt injection = disaster.

CapKit issues **cryptographically signed, time-bound capabilities**:

- ✅ **Scoped**: `post` to `/twitter`, not delete
- ✅ **Time-bound**: Expires in 10min
- ✅ **Signed**: HMAC-SHA256 verification  
- ✅ **Auditable**: Every action logged
- ✅ **Zero deps**: Sovereign-first (Node crypto only)

## Security Model

```type

Threat Model:
1. Agent prompt injection → Capability stays scoped
2. Key compromise → Time-bound limits damage  
3. Network failure → Works offline
4. Malicious actor → HMAC prevents tampering
```

## Demo

See [demo/agent-example.ts](demo/agent-example.ts)

## Install

```bash
npm install capkit
```

## API

```typescript
import { issueCapability, verifyCapability, checkPolicy } from 'capkit';

// Issue scoped permission
const cap = issueCapability({
  action: 'post',
  resource: '/twitter',
  key: 'your-secret-key',
  expiresIn: '10m'
});

// Agent uses capability
if (verifyCapability({ capability: cap, key: 'your-secret-key' }).valid) {
  console.log('✅ Agent authorized');
}
```

---

**Part of the Agent Builder Suite**  
→ [capkit](https://github.com/iamGodofall/capkit): Scoped capabilities for agents  
→ [quickbench](https://github.com/iamGodofall/quickbench): Reproducible agent evaluation  
→ [edge-run](https://github.com/iamGodofall/edge-run): Offline-first orchestration *(coming soon)*  
→ [connector-starter](https://github.com/iamGodofall/connector-starter): Generate adapters fast *(coming soon)*

*Built for builders who ship. MIT licensed. Local-first by design.*

## License

MIT
