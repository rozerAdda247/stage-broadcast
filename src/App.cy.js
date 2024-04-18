import React from 'react'
import App from './App'

describe('<App />', () => {
  context("720p resolution", () => {
    beforeEach(() => {
      // run these tests as if in a desktop
      // browser with a 720p monitor
      cy.viewport(1280, 720);
    });

    it("displays full header", () => {
      cy.get("nav .desktop-menu").should("be.visible");
      cy.get("nav .mobile-menu").should("not.be.visible");
    });
  });
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<App />)
  })
})