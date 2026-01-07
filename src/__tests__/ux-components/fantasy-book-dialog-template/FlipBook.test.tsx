import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FlipBook from '../../../ux-components/fantasy-book-dialog-template/FlipBook';

// Mock the react-pageflip library
// NOTE: We provide an explicit type instead of `any` to satisfy ESLint rules
jest.mock('react-pageflip', () => {
  return function HTMLFlipBook({
    children,
    className,
    style,
    ...props
  }: {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    // accept any extra props without using `any`
    [_: string]: unknown;
  }) {
    return (
      <div
        data-testid="html-flipbook"
        className={className}
        style={style}
        data-width={props.width}
        data-height={props.height}
        data-size={props.size}
        data-start-page={props.startPage}
        data-flipping-time={props.flippingTime}
        data-start-z-index={props.startZIndex}
      >
        {children}
      </div>
    );
  };
});

// Mock CSS modules
jest.mock('../../../ux-components/fantasy-book-dialog-template/css/FlipBook.module.css', () => ({
  flipbook: 'flipbook',
  flipbookContainer: 'flipbookContainer',
}));

describe('FlipBook Component', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(
        <FlipBook>
          <div>Page 1</div>
          <div>Page 2</div>
        </FlipBook>
      );

      expect(screen.getByTestId('html-flipbook')).toBeInTheDocument();
      expect(screen.getByText('Page 1')).toBeInTheDocument();
      expect(screen.getByText('Page 2')).toBeInTheDocument();
    });

    it('should render children correctly', () => {
      render(
        <FlipBook>
          <div>First Page</div>
          <div>Second Page</div>
          <div>Third Page</div>
        </FlipBook>
      );

      expect(screen.getByText('First Page')).toBeInTheDocument();
      expect(screen.getByText('Second Page')).toBeInTheDocument();
      expect(screen.getByText('Third Page')).toBeInTheDocument();
    });

    it('should apply default width and height', () => {
      render(
        <FlipBook>
          <div>Test Page</div>
        </FlipBook>
      );

      const flipbook = screen.getByTestId('html-flipbook');
      expect(flipbook).toHaveAttribute('data-width', '333');
      expect(flipbook).toHaveAttribute('data-height', '429');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom width and height', () => {
      render(
        <FlipBook width={500} height={600}>
          <div>Test Page</div>
        </FlipBook>
      );

      const flipbook = screen.getByTestId('html-flipbook');
      expect(flipbook).toHaveAttribute('data-width', '500');
      expect(flipbook).toHaveAttribute('data-height', '600');
    });

    it('should accept custom size prop', () => {
      render(
        <FlipBook size="stretch">
          <div>Test Page</div>
        </FlipBook>
      );

      const flipbook = screen.getByTestId('html-flipbook');
      expect(flipbook).toHaveAttribute('data-size', 'stretch');
    });

    it('should accept custom startPage', () => {
      render(
        <FlipBook startPage={2}>
          <div>Test Page</div>
        </FlipBook>
      );

      const flipbook = screen.getByTestId('html-flipbook');
      expect(flipbook).toHaveAttribute('data-start-page', '2');
    });

    it('should accept custom flippingTime', () => {
      render(
        <FlipBook flippingTime={500}>
          <div>Test Page</div>
        </FlipBook>
      );

      const flipbook = screen.getByTestId('html-flipbook');
      expect(flipbook).toHaveAttribute('data-flipping-time', '500');
    });

    it('should accept custom startZIndex', () => {
      render(
        <FlipBook startZIndex={2000}>
          <div>Test Page</div>
        </FlipBook>
      );

      const flipbook = screen.getByTestId('html-flipbook');
      expect(flipbook).toHaveAttribute('data-start-z-index', '2000');
    });

    it('should apply custom className', () => {
      render(
        <FlipBook className="custom-flipbook">
          <div>Test Page</div>
        </FlipBook>
      );

      const flipbook = screen.getByTestId('html-flipbook');
      expect(flipbook).toHaveClass('custom-flipbook');
    });
  });

  describe('Backdrop Functionality', () => {
    it('should render backdrop by default', () => {
      render(
        <FlipBook>
          <div>Test Page</div>
        </FlipBook>
      );

      const backdrop = screen.getByTestId('flipbook-backdrop');
      expect(backdrop).toBeInTheDocument();
    });

    it('should call onClickOutside when backdrop is clicked', () => {
      const handleClickOutside = jest.fn();
      render(
        <FlipBook onClickOutside={handleClickOutside}>
          <div>Test Page</div>
        </FlipBook>
      );

      const backdrop = screen.getByTestId('flipbook-backdrop');
      fireEvent.click(backdrop);
      expect(handleClickOutside).toHaveBeenCalledTimes(1);
    });

    it('should not call onClickOutside when clicking on flipbook container', () => {
      const handleClickOutside = jest.fn();
      render(
        <FlipBook onClickOutside={handleClickOutside}>
          <div>Test Page</div>
        </FlipBook>
      );

      const flipbookContainer = screen.getByTestId('flipbook-container');
      fireEvent.click(flipbookContainer);
      expect(handleClickOutside).not.toHaveBeenCalled();
    });

    it('should not call onClickOutside when onClickOutside is not provided', () => {
      render(
        <FlipBook>
          <div>Test Page</div>
        </FlipBook>
      );

      const backdrop = screen.getByTestId('flipbook-backdrop');
      // Should not throw error
      expect(() => fireEvent.click(backdrop)).not.toThrow();
    });
  });

  describe('Backdrop Styling', () => {
    it('should apply correct z-index to backdrop', () => {
      render(
        <FlipBook startZIndex={5000}>
          <div>Test Page</div>
        </FlipBook>
      );

      const backdrop = screen.getByTestId('flipbook-backdrop');
      expect(backdrop).toHaveStyle({ zIndex: '4999' }); // startZIndex - 1
    });

    it('should center the flipbook container in backdrop', () => {
      render(
        <FlipBook>
          <div>Test Page</div>
        </FlipBook>
      );

      const backdrop = screen.getByTestId('flipbook-backdrop');
      expect(backdrop).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should render without children', () => {
      render(<FlipBook />);
      expect(screen.getByTestId('html-flipbook')).toBeInTheDocument();
    });

    it('should render with single child', () => {
      render(
        <FlipBook>
          <div>Single Page</div>
        </FlipBook>
      );

      expect(screen.getByText('Single Page')).toBeInTheDocument();
    });

    it('should handle complex children', () => {
      render(
        <FlipBook>
          <div>
            <h1>Page Title</h1>
            <p>Page Content</p>
          </div>
        </FlipBook>
      );

      expect(screen.getByText('Page Title')).toBeInTheDocument();
      expect(screen.getByText('Page Content')).toBeInTheDocument();
    });

    it('should apply custom style prop', () => {
      render(
        <FlipBook style={{ border: '1px solid red' }}>
          <div>Test Page</div>
        </FlipBook>
      );

      const flipbook = screen.getByTestId('html-flipbook');
      expect(flipbook).toHaveStyle({ border: '1px solid red' });
    });
  });
});
