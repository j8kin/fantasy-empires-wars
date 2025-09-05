import React from 'react';
import { render, screen } from '@testing-library/react';
import MainView from '../ux-components/main-view/MainView';

describe('App Component', () => {
  it('renders the TopPanel component', () => {
    render(<MainView />);
    expect(screen.getByTestId('TopPanel')).toBeInTheDocument();
  });

  it('renders the Battlefield component', () => {
    render(<MainView />);
    expect(screen.getByTestId('Battlefield')).toBeInTheDocument();
  });
});
