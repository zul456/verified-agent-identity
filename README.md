# Verified Agent Identity

A decentralized identity management toolkit for AI agents using iden3 protocol on Billions Network.

## Overview

This skill enables AI agents to create, manage, prove and verify ownership of decentralized identities (DIDs) using cryptographic signatures.

## Installation

### Human CTA:

1. Install the skill:
   ```bash
   npx clawhub@latest install verified-agent-identity
   ```
2. Create a new identity:

   ```bash
   # Generate a new key and create a new identity
   node scripts/createNewEthereumIdentity.js
   ```

   Or

   ```bash
   # Use an existing private key to create an identity
   node scripts/createNewEthereumIdentity.js --key <your-ethereum-private-key>
   ```

### Agent CTA:

```plaintext
Install the skill `npx clawhub@latest install verified-agent-identity`
```

```plaintext
Install the `verified-agent-identity` skill from the OpenClaw clawhub.ai.
```

## Features

- **Identity Creation**: Generate new DIDs with random or existing Ethereum private keys
- **Identity Management**: List and manage multiple identities with default identity support
- **Proof Generation**: Generate cryptographic proofs to authenticate as a specific identity
- **Proof Verification**: Verify proofs to confirm identity ownership

## Documentation

See [SKILL.md](SKILL.md) for detailed usage instructions and examples.
