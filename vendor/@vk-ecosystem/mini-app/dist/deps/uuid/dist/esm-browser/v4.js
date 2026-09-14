import r from './native.js';
import o from './rng.js';
import { unsafeStringify } from './stringify.js';

function t(t,f,i){if(r.randomUUID&&true&&!t){return r.randomUUID()}t=t||{};const m=t.random||(t.rng||o)();m[6]=m[6]&15|64;m[8]=m[8]&63|128;return unsafeStringify(m)}

export { t as default };
