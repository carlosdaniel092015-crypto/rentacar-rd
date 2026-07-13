import { serwist } from "@serwist/next/config";
import { injectManifest } from "@serwist/build";

const result = await serwist({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
});

const { count, size, warnings } = await injectManifest(result);
if (warnings.length > 0) {
  console.warn("[@serwist] Warnings:", warnings.join("\n"));
}
console.log(`[@serwist] Service worker compilado: ${count} entradas, ${(size / 1024).toFixed(1)} KB`);
