use wasm_bindgen::prelude::*;
use argon2::Argon2;
use argon2::password_hash::SaltString;
use zeroize::Zeroize;
use getrandom::getrandom;

// ---------------------------------------------------------------------------
// BIP-39 English wordlist (2048 words)
// ---------------------------------------------------------------------------
use bip39::{Mnemonic, Language};

/// Generate 12 random words from the BIP-39 list using the bip39 crate.
#[wasm_bindgen]
pub fn generate_mnemonic() -> String {
    let mut entropy = [0u8; 16]; // 128 bits for 12 words
    getrandom(&mut entropy).expect("RNG failed");
    let mnemonic = Mnemonic::from_entropy(&entropy).expect("Mnemonic generation failed");
    mnemonic.to_string()
}

// ---------------------------------------------------------------------------
// Internal Vault RAM — lives in Wasm linear memory, never exported to JS
// ---------------------------------------------------------------------------
static mut VAULT_KEY: [u8; 32] = [0u8; 32];

#[wasm_bindgen]
pub fn derive_key(password: &str, salt: &str) -> Result<Vec<u8>, JsValue> {
    // 1. Prepare Argon2id
    // Memory: 64MiB, Iterations: 3, Parallelism: 1 (safe for Wasm single thread)
    let argon2 = Argon2::new(
        argon2::Algorithm::Argon2id,
        argon2::Version::V0x13,
        argon2::Params::new(65536, 3, 1, None).map_err(|e| JsValue::from_str(&e.to_string()))?,
    );

    // 2. Hash the password
    let salt_str = SaltString::from_b64(salt).map_err(|e| JsValue::from_str(&e.to_string()))?;
    
    // 3. Derive a 32-byte key
    let mut output = [0u8; 32];
    argon2.hash_password_into(
        password.as_bytes(),
        salt_str.as_salt().as_str().as_bytes(),
        &mut output
    ).map_err(|e| JsValue::from_str(&e.to_string()))?;

    // 4. Store the key in the static internal vault (RAM)
    unsafe {
        VAULT_KEY.copy_from_slice(&output);
    }

    // 5. Zeroize the temporary output buffer
    output.zeroize();

    // 6. Return the full key for demonstration purposes (Mock only)
    unsafe {
        Ok(VAULT_KEY.to_vec())
    }
}

/// Sign a "transaction" hash using the internal key
/// Returns a mock 64-byte signature
#[wasm_bindgen]
pub fn secure_sign(tx_hash: &[u8]) -> Result<Vec<u8>, JsValue> {
    unsafe {
        // Check if key is initialized (not all zeros)
        if VAULT_KEY.iter().all(|&b| b == 0) {
            return Err(JsValue::from_str("Vault is locked (no key in RAM)"));
        }

        // Mock Signature logic: Blake2b or simple HMAC simulation
        // In a real app, this would use ed25519-dalek
        let mut signature = vec![0u8; 64];
        
        // Simulating signing: XOR some of the key into the signature
        for i in 0..32 {
            signature[i] = tx_hash[i % tx_hash.len()] ^ VAULT_KEY[i];
            signature[i+32] = tx_hash[(i+1) % tx_hash.len()] ^ !VAULT_KEY[i];
        }

        Ok(signature)
    }
}

/// Securely zero all sensitive internal buffers.
#[wasm_bindgen]
pub fn lock_vault() {
    unsafe {
        VAULT_KEY.zeroize();
    }
}

/// Generate a secure 16-character Salt for Argon2id
#[wasm_bindgen]
pub fn generate_salt() -> String {
    let mut salt = [0u8; 16];
    getrandom(&mut salt).expect("RNG failed");
    // Manual Base64 encoding for SaltString or just use a helper
    let salt_str = password_hash::SaltString::encode_b64(&salt).expect("B64 encode failed");
    salt_str.to_string()
}
