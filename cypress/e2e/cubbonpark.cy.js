
import React from "react";
import Header from "../../src/components/Header";
describe('Render', () => {
  it('renders', () => {
    cy.mount(<Header />);
  })
})