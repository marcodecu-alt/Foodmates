import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Workaround for Next.js 14 bug: route groups with only a layout.tsx
    // (no direct page.tsx) fail to generate page_client-reference-manifest.js,
    // causing an ENOENT error during output file tracing.
    if (isServer) {
      config.plugins.push({
        apply(compiler) {
          compiler.hooks.done.tap("FixRouteGroupManifest", () => {
            const dir = join(
              process.cwd(),
              ".next",
              "server",
              "app",
              "(app)"
            );
            const file = join(dir, "page_client-reference-manifest.js");
            try {
              mkdirSync(dir, { recursive: true });
              if (!existsSync(file)) {
                writeFileSync(
                  file,
                  "self.__RSC_MANIFEST=self.__RSC_MANIFEST||{};"
                );
              }
            } catch (_) {
              // non-fatal
            }
          });
        },
      });
    }
    return config;
  },
};

export default nextConfig;
