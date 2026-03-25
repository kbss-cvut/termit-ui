/// <reference types="vite-plugin-svgr/client" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from "vite-plugin-svgr";

export default defineConfig({
    plugins: [react(),
        svgr({
            include: '**/*.svg?react',
        }),],
    build: {
        outDir: 'build', // CRA's default build output
    },
    server: {
        port: 3000
    },
});
