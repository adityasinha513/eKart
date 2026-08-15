import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // The EkartGateway (Spring Cloud Gateway) doesn't send CORS headers of its own, so
    // browser requests straight to http://localhost:4000 are blocked by CORS in dev.
    // Proxying same-origin /api calls through Vite's dev server sidesteps that without
    // touching backend code — production builds should be served behind a reverse proxy
    // that does the same, or point VITE_API_BASE_URL at a CORS-enabled gateway.
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
