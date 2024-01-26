// vite.config.js

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// Define Vite configuration using the defineConfig function
export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '');

  // Vite configuration object
  return {
    // Define global constants that will be replaced at build time
    define: {
      'process.env.API_URL': JSON.stringify(env.API_URL),
    },
    // Configuration for optimizing dependencies during build
    optimizeDeps: {
      esbuild: {
        // Silent logging for specific cases. https://github.com/vitejs/vite/issues/8644#issuecomment-1159308803
        logOverride: { 'this-is-undefined-in-esm': 'silent' },
      },
      esbuildOptions: {
        // Specify the target environment for ESBuild
        target: 'es2020',
      },
    },
    // Vite plugins to use during development/build
    plugins: [
      react({
        babel: {
          plugins: ['babel-plugin-macros', 'babel-plugin-styled-components'],
        },
      }),
    ],
    server: {
      // Proxy configuration for API requests
      proxy: {
        '/api': {
          target: env.API_URL,
          changeOrigin: true,
        },
      },
    },
  };
});
