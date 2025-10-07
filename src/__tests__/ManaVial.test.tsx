import React from 'react';
import { render, screen } from '@testing-library/react';
import { ManaType } from '../types/Mana';
import ManaVial from '../ux-components/vial-panel/ManaVial';

describe('ManaVial Component - Basic Tests', () => {
  it('should render with percentage text', () => {
    render(<ManaVial color={ManaType.RED} mana={50} />);
    expect(screen.getByTestId('red-mana-vial')).toBeInTheDocument();
    expect(screen.getByTestId('red-mana-vial-percentage')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('should render with different percentages for same color', () => {
    render(<ManaVial color={ManaType.RED} mana={80} />);
    expect(screen.getByTestId('red-mana-vial')).toBeInTheDocument();
    expect(screen.getByTestId('red-mana-vial-percentage')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('should render with different percentages', () => {
    render(<ManaVial color={ManaType.BLUE} mana={300} />);
    expect(screen.getByTestId('blue-mana-vial')).toBeInTheDocument();
    expect(screen.getByTestId('blue-mana-vial-percentage')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should handle zero percentage', () => {
    render(<ManaVial color={ManaType.GREEN} mana={0} />);
    expect(screen.getByTestId('green-mana-vial')).toBeInTheDocument();
    expect(screen.getByTestId('green-mana-vial-percentage')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should handle 100 percentage', () => {
    render(<ManaVial color={ManaType.WHITE} mana={200} />);
    expect(screen.getByTestId('white-mana-vial')).toBeInTheDocument();
    expect(screen.getByTestId('white-mana-vial-percentage')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should render with different color', () => {
    render(<ManaVial color={ManaType.BLACK} mana={130} />);
    expect(screen.getByTestId('black-mana-vial')).toBeInTheDocument();
    expect(screen.getByTestId('black-mana-vial-percentage')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
  });
});
