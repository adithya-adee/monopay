let _wasm = null;

/**
 * Initializes the Wasm module.
 * The Wasm memory object is contained within this module closure
 * and is NEVER exposed to the global scope or other JS files.
 */
export async function initVault() {
  if (_wasm) return;
  
  // Dynamic import loads the Wasm seamlessly in Vite
  const mod = await import("../wasm/wasm_seed_vault.js");
  
  // Initialize the Wasm instance (downloads and compiles .wasm)
  await mod.default();
  
  _wasm = mod;
  console.log("🔒 Wasm Seed Vault initialized locally.");
}

/**
 * Validates a word and returns its BIP-39 index.
 * Returns -1 if invalid.
 */
export function wordToIndex(word) {
  if (!_wasm) throw new Error("Vault not initialized");
  return _wasm.word_to_index(word);
}

/**
 * Generates 12 random BIP-39 indices using Wasm RNG.
 */
export function generateIndices() {
  if (!_wasm) throw new Error("Vault not initialized");
  return _wasm.generate_indices();
}

/**
 * Returns the word for a given index.
 */
export function indexToWord(index) {
  if (!_wasm) throw new Error("Vault not initialized");
  return _wasm.index_to_word(index);
}

/**
 * Passes the Uint16Array of indices to Wasm and derives the keypair.
 * Returns the public key bytes.
 */
export function deriveKeypair(uint16Array) {
  if (!_wasm) throw new Error("Vault not initialized");
  if (!(uint16Array instanceof Uint16Array)) {
    throw new Error("Must pass a Uint16Array immediately");
  }
  
  return _wasm.derive_keypair(uint16Array);
}

/**
 * Wipes the internal Wasm buffers securely.
 */
export function secureWipe() {
  if (!_wasm) return;
  _wasm.secure_wipe();
  console.log("🧹 Wasm internal buffers wiped (zeroize)");
}

/**
 * Helper to hex-encode a Uint8Array
 */
export function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
