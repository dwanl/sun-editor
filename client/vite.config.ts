import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'vscode': require.resolve('@codingame/monaco-languageclient/lib/vscode-compatibility')
    },
  }
})
