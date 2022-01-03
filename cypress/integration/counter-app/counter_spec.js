/// <reference types="cypress" />

// Welcome to Cypress!
//
// This spec file contains a variety of sample tests
// for a todo list app that are designed to demonstrate
// the power of writing tests in Cypress.
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

describe('counter app', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3002')
  })

  it('displays the current counter', () => {
    cy.get('#counter').should('have.text', 'Counter: 0');
  })

  it('increments the counter', () => {
    cy.get('#counter').should('have.text', 'Counter: 0');

    cy.get('a').contains('Increment').click();

    cy.get('#counter').should('have.text', 'Counter: 1');
  })
})
