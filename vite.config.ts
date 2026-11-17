import { preact } from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import { uniqueMark } from 'shuutils/plugins'
import { defineConfig } from 'vite'
import svgReact from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  build: { reportCompressedSize: false },
  plugins: [preact(), svgReact(), tailwindcss(), uniqueMark()],
})
