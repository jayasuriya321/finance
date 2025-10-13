import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// If deploying to a subpath, change base to '/your-subpath/'
export default defineConfig({
  plugins: [react()],
  base: "/", 
});
