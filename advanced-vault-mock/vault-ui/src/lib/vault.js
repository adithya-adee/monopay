import init, { derive_key, secure_sign, lock_vault, generate_salt, generate_mnemonic } from "../wasm/wasm_vault.js";

/**
 * Vault Service
 * Handles Argon2id via Wasm and AES-GCM via Web Crypto
 */
class VaultService {
  constructor() {
    this.initialized = false;
    this.wasmLoaded = false;
  }

  async initialize() {
    if (!this.wasmLoaded) {
      await init();
      this.wasmLoaded = true;
      console.log("🔒 [Vault] Wasm Module Loaded & Initialized");
    }
  }

  async generateMnemonic() {
    await this.initialize();
    return generate_mnemonic();
  }

  /**
   * Setup a new vault
   * @param {string} password - User master password
   * @param {string} secret - Private key or Seed phrase to store
   */
  async setupVault(password, secret) {
    await this.initialize();
    
    console.log(`🛠️ [Vault] [${performance.now().toFixed(2)}ms] Starting Setup Flow for ${secret.split(' ').length} words...`);
    const salt = generate_salt();
    console.log("🧂 [Vault] Argon2id Salt Generated (Hex):", salt);

    // 1. Derive key in Wasm (Argon2id)
    console.log(`🧬 [Vault] [${performance.now().toFixed(2)}ms] Deriving key via Argon2id (m=64MiB, t=3, p=1)...`);
    const startTime = performance.now();
    const vaultId = await derive_key(password, salt);
    const endTime = performance.now();
    
    console.log("🔑 [Vault] Derived Key (Uint8Array):", vaultId);
    console.log("💾 [Vault] Derived Key (Hex String):", Array.from(vaultId).map(b => b.toString(16).padStart(2, '0')).join(''));
    console.log(`⏱️ [Vault] Key Derivation took ${(endTime - startTime).toFixed(2)}ms`);

    // 2. Encrypt Secret via Web Crypto (AES-GCM)
    // We use a separate random IV for storage
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // We need a CryptoKey for AES-GCM. 
    // IMPORTANT: We use the *same* 32-byte key from Wasm (conceptualized here)
    // In this mock, we'll re-derive or just use a placeholder to show the flow.
    // Real implementation should extract the 32 bytes from Wasm for Web Crypto.
    
    // For this mock's JIT demonstration, we'll store everything and 'lock' it.
    console.log("🔐 [Vault] Encrypting secret with AES-GCM...");
    
    // Wiping temporary secret text
    const encryptedData = {
      salt,
      iv: Array.from(iv),
      // In a real app, this would be the actual AES-GCM ciphertext
      // Here we just store a 'mock' ciphertext to focus on the key lifecyle
      ciphertext: "ENC-" + Math.random().toString(36).substring(2), 
      params: { m: 65536, t: 3, p: 1 }
    };

    localStorage.setItem("vault_storage", JSON.stringify(encryptedData));
    console.log("💾 [Vault] Full Storage Object (JSON):", encryptedData);
    console.log("💾 [Vault] Encrypted blob saved to localStorage.");
    
    // 3. LOCK the vault memory immediately
    lock_vault();
    console.log("🧹 [Vault] Sensitive memory zeroed out in Wasm.");
    
    return true;
  }

  /**
   * Decrypt and perform a secure operation
   */
  async signTransaction(password, txData) {
    await this.initialize();
    
    const storageItem = localStorage.getItem("vault_storage");
    if (!storageItem) throw new Error("No vault found");
    
    console.log("📂 [Vault] Read from Storage:", JSON.parse(storageItem));
    const { salt, iv: _iv, ciphertext: _ciphertext } = JSON.parse(storageItem);
    
    console.log("🔓 [Vault] Unlocking for Signing...");
    
    // 1. Re-derive key (JIT)
    console.log(`🧬 [Vault] [${performance.now().toFixed(2)}ms] Step 1: Argon2id JIT Re-derivation...`);
    const jitStartTime = performance.now();
    const jitKey = await derive_key(password, salt);
    const jitEndTime = performance.now();
    
    console.log("🔑 [Vault] JIT Re-derived Key (Uint8Array):", jitKey);
    console.log(`⏱️ [Vault] JIT Re-derivation took ${(jitEndTime - jitStartTime).toFixed(2)}ms`);
    
    // 2. Perform Signing inside Wasm
    console.log("✍️ [Vault] Step 2: Signing transaction inside Wasm RAM...");
    const txHash = new TextEncoder().encode(JSON.stringify(txData));
    const signature = await secure_sign(txHash);
    
    console.log("✅ [Vault] Step 3: Signature generated:", Array.from(signature.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join('') + "...");
    
    // 3. WIPE IMMEDIATELY
    lock_vault();
    console.log("🧹 [Vault] Step 4: Sensitive memory zeroed out. Private key exposure window closed.");
    
    return signature;
  }

  isLocked() {
    // Check if the vault exists in local storage
    return !!localStorage.getItem("vault_storage");
  }

  clear() {
    localStorage.removeItem("vault_storage");
    lock_vault();
  }
}

export const vault = new VaultService();
