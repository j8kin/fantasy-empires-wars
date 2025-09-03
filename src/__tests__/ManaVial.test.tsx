import React from 'react';
import { render, screen } from '@testing-library/react';
import ManaVial from '../ux-components/top-panel/ManaVial';

describe('ManaVial Component - Basic Tests', () => {
  it('should render with percentage text', () => {
    render(<ManaVial color="red" percentage={50} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should render with different percentages', () => {
    render(<ManaVial color="blue" percentage={75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should handle zero percentage', () => {
    render(<ManaVial color="green" percentage={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should handle 100 percentage', () => {
    render(<ManaVial color="white" percentage={100} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should render vial container with correct class', () => {
    const { container } = render(<ManaVial color="red" percentage={50} />);

    const vialContainer = container.firstChild as HTMLElement;
    expect(vialContainer).toHaveClass('ball');
  });

  it('should render text with correct class', () => {
    const { container } = render(<ManaVial color="blue" percentage={25} />);

    const textSpan = container.querySelector('span') as HTMLElement;
    expect(textSpan).toHaveClass('value');
  });
});
