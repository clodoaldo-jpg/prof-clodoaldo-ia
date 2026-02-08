import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    plugins: [react()],
    define: {
      // Define process.env como objeto vazio para evitar erro "process is not defined"
      // NÃO injetamos mais a API_KEY aqui por segurança. Ela fica apenas no servidor (Netlify Functions).
      'process.env': {},
    },
    server: {
      port: 3000
    }
  };
});