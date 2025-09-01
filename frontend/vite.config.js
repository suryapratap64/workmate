import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { Buffer } from "buffer";
import process from "process";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      stream: "stream-browserify",
      buffer: "buffer",
      util: "util",
      process: "process/browser",
    },
  },
  define: {
    "process.env": {},
    global: "globalThis",
   'global.Buffer': 'undefined',
    "global.process": process,
  },
  optimizeDeps: {
    include: [
      "buffer",
      "process",
      "events",
      "stream-browserify",
      "simple-peer",
    ],
    esbuildOptions: {
      target: "esnext",
      supported: {
        bigint: true,
      },
    },
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          "simple-peer": ["simple-peer"],
        },
      },
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
});
