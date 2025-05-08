import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  it('renders the ManaPanel component', () => {
    render(<App />);
    expect(document.querySelector('#ManaPanel')).not.toBeNull();
  });

  it('renders the MainMap component', () => {
    render(<App />);
    expect(document.querySelector('#MainMap')).not.toBeNull();
  });
});
