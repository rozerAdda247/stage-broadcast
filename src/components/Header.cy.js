import React from 'react'
import Header from './Header'

describe('<Header />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    const header = cy.mount(<Header />)
  })
})