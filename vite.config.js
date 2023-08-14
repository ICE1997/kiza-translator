import {defineConfig} from 'vite';
import {crx} from '@crxjs/vite-plugin';
import manifest from './manifest.json' assert {type: "json"};

export default defineConfig({
  plugins: [crx({manifest})],
})