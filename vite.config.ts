import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'
import svgReact from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    svgReact(),
  ],
})
