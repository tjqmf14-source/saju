import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const lunarLib = require('../vendor/lunar.cjs');
Object.assign(globalThis, lunarLib);
