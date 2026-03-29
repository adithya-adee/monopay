/* tslint:disable */
/* eslint-disable */

export function derive_key(password: Uint8Array, salt: string): Uint8Array;

/**
 * Generate 12 random words from the BIP-39 list using the bip39 crate.
 */
export function generate_mnemonic(): string;

/**
 * Generate a secure 16-character Salt for Argon2id
 */
export function generate_salt(): string;

/**
 * Securely zero all sensitive internal buffers.
 */
export function lock_vault(): void;

/**
 * Sign a "transaction" hash using the internal key
 * Returns a mock 64-byte signature
 */
export function secure_sign(tx_hash: Uint8Array): Uint8Array;

/**
 * SIGN + ZEROIZE in one atomic step to close the "Tick Gap"
 */
export function sign_with_password(password: Uint8Array, salt: string, tx_hash: Uint8Array): Uint8Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly derive_key: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly generate_mnemonic: () => [number, number];
    readonly generate_salt: () => [number, number];
    readonly lock_vault: () => void;
    readonly secure_sign: (a: number, b: number) => [number, number, number, number];
    readonly sign_with_password: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
