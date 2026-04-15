import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devProxyTarget = (env.VITE_DEV_PROXY_TARGET || '').trim();
  const isTestRun = mode === 'test' || process.env.VITEST === 'true';

  return {
    // Vitest does not need React Fast Refresh, so we can let Vite's native JSX
    // transform handle tests and avoid the plugin-react rolldown/esbuild warning.
    plugins: isTestRun ? [] : [react()],
    assetsInclude: ['**/*.PNG'],
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setupTests.js',
      globals: true,
      css: true,
    },
    server: {
      port: 5173,
      open: true,
      proxy: devProxyTarget
        ? {
            '/api': {
              target: devProxyTarget,
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
  };
});
