import { createRequire } from "module";

const require = createRequire(import.meta.url);

let config = [];
try {
  // Prefer Next.js flat config (includes core-web-vitals rules)
  const next = require("eslint-config-next");
  config = [...next()];
} catch (err) {
  // Fall back to empty config if eslint-config-next isn't available at build time
  config = [];
}

export default config;
