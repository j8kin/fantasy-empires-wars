import React from 'react';
import { render, screen } from '@testing-library/react';
import ManaVial from '../ux-components/vial-panel/ManaVial';

describe('ManaVial Component - Basic Tests', () => {
  it('should render with percentage text', () => {
    render(<ManaVial color="red" percentage={50} />);
    expect(screen.getByTestId('red-mana-vial')).toBeInTheDocument();
    expect(screen.getByTestId('red-mana-vial-percentage')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should render with different percentages for same color', () => {
    render(<ManaVial color="red" percentage={75} />);
    expect(screen.getByTestId('red-mana-vial')).toBeInTheDocument();
    expect(screen.getByTestId('red-mana-vial-percentage')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should render with different percentages', () => {
    render(<ManaVial color="blue" percentage={75} />);
    expect(screen.getByTestId('blue-mana-vial')).toBeInTheDocument();
    expect(screen.getByTestId('blue-mana-vial-percentage')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should handle zero percentage', () => {
    render(<ManaVial color="green" percentage={0} />);
    expect(screen.getByTestId('green-mana-vial')).toBeInTheDocument();
    expect(screen.getByTestId('green-mana-vial-percentage')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should handle 100 percentage', () => {
    render(<ManaVial color="white" percentage={100} />);
    expect(screen.getByTestId('white-mana-vial')).toBeInTheDocument();
    expect(screen.getByTestId('white-mana-vial-percentage')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should render with different color', () => {
    render(<ManaVial color="black" percentage={75} />);
    expect(screen.getByTestId('black-mana-vial')).toBeInTheDocument();
    expect(screen.getByTestId('black-mana-vial-percentage')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});
