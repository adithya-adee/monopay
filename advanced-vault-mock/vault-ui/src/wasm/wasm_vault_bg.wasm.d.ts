/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const derive_key: (a: number, b: number, c: number, d: number) => [number, number, number, number];
export const generate_mnemonic: () => [number, number];
export const generate_salt: () => [number, number];
export const lock_vault: () => void;
export const secure_sign: (a: number, b: number) => [number, number, number, number];
export const sign_with_password: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
export const __wbindgen_exn_store: (a: number) => void;
export const __externref_table_alloc: () => number;
export const __wbindgen_externrefs: WebAssembly.Table;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
export const __externref_table_dealloc: (a: number) => void;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __wbindgen_start: () => void;
