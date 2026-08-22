import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        configure(proxy) {
          proxy.on("error", (_err, _req, res) => {
            if (!res || res.headersSent) {
              return;
            }
            res.writeHead(502, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                error:
                  "Unable to reach the GlobeTrotter API. Start it with: cd server && npm run dev",
              }),
            );
          });
        },
      },
    },
  },
});
