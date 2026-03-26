# Secure Seed Phrase Vault Mock

A mock implementation demonstrating high-security seed phrase handling in a browser environment using Rust/Wasm and React.

## 🛡️ Security Architecture

This mock addresses common browser-based wallet vulnerabilities (heap leaks, string interning, and insecure memory management) through three key techniques:

1.  **Uint16Array Storage**: Seed phrase words are never joined into a single string. They are converted to BIP-39 indices (0-2047) immediately upon entry and stored in a `Uint16Array(12)` for deterministic zeroing.
2.  **Wasm Isolation**: Sensitive logic (BIP-39 lookup and key derivation) is encapsulated in a Rust/Wasm module. The Wasm memory area is isolated from the global JavaScript scope using a module-level closure.
3.  **Secure Memory Wiping**: We use the `zeroize` crate in Rust to perform compiler-proof memory wiping of internal Wasm buffers. In JavaScript, the `Uint16Array` is explicitly filled with zeros after derivation, component unmount, or page close.

## 🚀 Key Features

- **Secure Random Generation**: Generate a new 12-word mnemonic using Wasm's secure RNG (`getrandom`).
- **Individual Password Inputs**: 12 separate inputs that mask words and clear the original string the moment a valid word is recognized.
- **Mock Key Derivation**: Uses PBKDF2-HMAC-SHA512 to derive a 64-byte keypair (mocking BIP-39 seed derivation). Only the 32-byte public key is ever returned to JS.
- **Copy to Clipboard**: Securely copy the derived public key.
- **Memory Debugger**: Visual indicator that confirms the `Uint16Array` is zeroed out post-derivation.

## 🛠️ Tech Stack

- **Rust**: Wasm module with `wasm-bindgen`, `zeroize`, `sha2`, and `pbkdf2`.
- **React**: Vite + React (JavaScript) with a premium dark-mode custom CSS.
- **Bun**: Fast package management and runtime.

## 📖 How to Run

### 1. Build the Wasm Crate
Requires `wasm-pack` installed.
```bash
cd wasm-seed-vault
wasm-pack build --target web --out-dir ../seed-ui/src/wasm
```

### 2. Run the React App
```bash
cd seed-ui
bun install
bun run dev
```

## ⚠️ Limitations

This implementation represents the "software ceiling" for browser security. It cannot prevent:
- **OS-level Swapping**: If the OS pages browser memory to disk, the zeroing won't affect the paged data.
- **Malicious Extensions**: Keyloggers can still capture keystrokes before they reach the input handlers. (Mitigation: Use a Virtual Keyboard).
- **Physical Memory Access**: Forensics tools can read RAM directly.
