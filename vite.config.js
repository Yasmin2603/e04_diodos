import { defineConfig } from 'vite';

// Caminhos relativos: funciona em usuario.github.io/<repo>/ sem depender do nome do repositório.
export default defineConfig({
  base: './',
});
