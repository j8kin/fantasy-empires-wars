import React from 'react';
import { render } from '@testing-library/react';
import MainView from '../ux-components/main-view/MainView';

describe('App Component', () => {
  it('renders the TopPanel component', () => {
    render(<MainView />);
    expect(document.querySelector('#TopPanel')).not.toBeNull();
  });

  it('renders the Battlefield component', () => {
    render(<MainView />);
    expect(document.querySelector('#Battlefield')).not.toBeNull();
  });
});
