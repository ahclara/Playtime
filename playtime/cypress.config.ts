import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Front-end Next.js (npm run dev)
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1366,
    viewportHeight: 900,
    defaultCommandTimeout: 15000,
    responseTimeout: 60000,
    requestTimeout: 30000,
    pageLoadTimeout: 120000, // o primeiro acesso ao `next dev` compila a página
    video: false,
    screenshotOnRunFailure: true,
  },
  // Valores públicos (lidos com Cypress.expose). Sobrescreva com --expose apiUrl=...
  expose: {
    apiUrl: 'http://localhost:5000/api',
  },
  // Credenciais dos usuários de teste (lidas com cy.env). Sobrescreva em
  // cypress.env.json (veja cypress.env.example.json), --env ou CYPRESS_<nome>.
  env: {
    gerenteEmail: 'gerente.cypress@playtime.com',
    gerenteSenha: 'gerente123',
    vendedorEmail: 'vendedor.cypress@playtime.com',
    vendedorSenha: 'vendedor123',
  },
});
