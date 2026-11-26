import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const config: NextConfig = {
  agentRules: false,
  turbopack: { root: fileURLToPath(new URL('.', import.meta.url)) },
  devIndicators: false,
  serverExternalPackages: ['@huggingface/transformers'],
  outputFileTracingExcludes: {
    '*': ['./.model-cache/**/*'],
  },
};

export default config;
