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

use lazy_static::lazy_static;
use std::sync::Mutex;

// ---------------------------------------------------------------------------
// Internal Vault RAM — safe global state via Mutex
// ---------------------------------------------------------------------------
lazy_static! {
    static ref VAULT_KEY: Mutex<[u8; 32]> = Mutex::new([0u8; 32]);
}

#[wasm_bindgen]
pub fn derive_key(password: &[u8], salt: &str) -> Result<Vec<u8>, JsValue> {
    // 1. Prepare Argon2id
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
        password, // Now using &[u8]
        salt_str.as_salt().as_str().as_bytes(),
        &mut output
    ).map_err(|e| JsValue::from_str(&e.to_string()))?;

    // 4. Store the key in the protected vault (RAM)
    let mut key = VAULT_KEY.lock().map_err(|e| JsValue::from_str(&e.to_string()))?;
    key.copy_from_slice(&output);

    // 5. Zeroize the temporary output buffer
    output.zeroize();

    // 6. Return the full key for demonstration purposes (Mock only)
    Ok(key.to_vec())
}

/// SIGN + ZEROIZE in one atomic step to close the "Tick Gap"
#[wasm_bindgen]
pub fn sign_with_password(password: &[u8], salt: &str, tx_hash: &[u8]) -> Result<Vec<u8>, JsValue> {
    // 1. Derivation (Directly within this function)
    let argon2 = Argon2::new(
        argon2::Algorithm::Argon2id,
        argon2::Version::V0x13,
        argon2::Params::new(65536, 3, 1, None).map_err(|e| JsValue::from_str(&e.to_string()))?,
    );
    let salt_str = SaltString::from_b64(salt).map_err(|e| JsValue::from_str(&e.to_string()))?;
    
    let mut derived_key = [0u8; 32];
    argon2.hash_password_into(
        password,
        salt_str.as_salt().as_str().as_bytes(),
        &mut derived_key
    ).map_err(|e| JsValue::from_str(&e.to_string()))?;

    // 2. Sign
    let mut signature = vec![0u8; 64];
    for i in 0..32 {
        signature[i] = tx_hash[i % tx_hash.len()] ^ derived_key[i];
        signature[i+32] = tx_hash[(i+1) % tx_hash.len()] ^ !derived_key[i];
    }

    // 3. IMMEDIATE ZEROIZATION of the key on the stack
    derived_key.zeroize();

    Ok(signature)
}

/// Sign a "transaction" hash using the internal key
/// Returns a mock 64-byte signature
#[wasm_bindgen]
pub fn secure_sign(tx_hash: &[u8]) -> Result<Vec<u8>, JsValue> {
    let key = VAULT_KEY.lock().map_err(|e| JsValue::from_str(&e.to_string()))?;
    
    // Check if key is initialized (not all zeros)
    if key.iter().all(|&b| b == 0) {
        return Err(JsValue::from_str("Vault is locked (no key in RAM)"));
    }

    // Mock Signature logic: Blake2b or simple HMAC simulation
    let mut signature = vec![0u8; 64];
    
    // Simulating signing: XOR some of the key into the signature
    for i in 0..32 {
        signature[i] = tx_hash[i % tx_hash.len()] ^ key[i];
        signature[i+32] = tx_hash[(i+1) % tx_hash.len()] ^ !key[i];
    }

    Ok(signature)
}

/// Securely zero all sensitive internal buffers.
#[wasm_bindgen]
pub fn lock_vault() {
    if let Ok(mut key) = VAULT_KEY.lock() {
        key.zeroize();
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
