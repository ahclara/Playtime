import './commands';

// Erros de hidratação/HMR do `next dev` não devem derrubar os testes.
Cypress.on('uncaught:exception', (err) => {
  if (/hydrat|NEXT_REDIRECT|ResizeObserver/i.test(err.message)) return false;
  return undefined;
});

// "Aquece" o `next dev`: compila todas as páginas antes dos testes de interface.
// Sem isso, a primeira visita a cada página pode levar 30 s ou mais (ainda mais dentro do OneDrive)
// e o teste desiste de esperar.
const PAGINAS = [
  '/', '/cadastro', '/produtos', '/carrinho', '/finalizar', '/compras',
  '/admin', '/admin/clientes', '/admin/produtos', '/admin/vendas', '/admin/cancelamentos', '/admin/relatorios',
];

before(() => {
  if (!Cypress.spec.relative.replace(/\\/g, '/').includes('/frontend/')) return;
  PAGINAS.forEach((pagina) => {
    cy.request({ url: pagina, failOnStatusCode: false, timeout: 180000, log: false });
  });
});