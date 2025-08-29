import React from 'react';
import { render } from '@testing-library/react';
import MainCanvas from '../ux-components/MainCanvas';

describe('App Component', () => {
  it('renders the ManaPanel component', () => {
    render(<MainCanvas />);
    expect(document.querySelector('#ManaPanel')).not.toBeNull();
  });

  it('renders the MainMap component', () => {
    render(<MainCanvas />);
    expect(document.querySelector('#MainMap')).not.toBeNull();
  });
});
