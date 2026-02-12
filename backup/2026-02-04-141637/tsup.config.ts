import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  splitting: false,
  clean: true,
  target: "es2022",
  esbuildOptions(options) {
    options.banner ??= {};
    const existing = options.banner.js ? `${options.banner.js}\n` : "";
    if (options.format === "esm") {
      options.banner.js =
        existing + "const __PLASIUS_IMPORT_META_URL__ = import.meta.url;";
    } else {
      options.banner.js =
        existing +
        'const { pathToFileURL } = require("url"); const __PLASIUS_IMPORT_META_URL__ = pathToFileURL(__filename).href;';
    }
  },
});
