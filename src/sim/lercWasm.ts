// The LERC decoder's wasm, resolved by the bundler.
//
// This lives in its own module and is imported dynamically so that nothing
// running under node or bun (the diagnostics in scripts/) ever touches it:
// `?url` is a Vite-only import and would fail outside the bundler.
import wasmUrl from "lerc/lerc-wasm.wasm?url";

export default wasmUrl;
