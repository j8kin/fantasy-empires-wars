import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PopupWrapper from '../../../ux-components/popups/PopupWrapper';
import { ApplicationContextProvider } from '../../../contexts/ApplicationContext';

// Mock FantasyBorderFrame component
jest.mock('../../../ux-components/fantasy-border-frame/FantasyBorderFrame', () => {
  return ({
    screenPosition,
    frameSize,
    children,
    tileDimensions,
    accessible,
    flexibleSizing,
  }: any) => (
    <div
      data-testid="fantasy-border-frame"
      data-x={screenPosition.x}
      data-y={screenPosition.y}
      data-width={frameSize.width}
      data-height={frameSize.height}
      data-tile-width={tileDimensions?.width}
      data-tile-height={tileDimensions?.height}
      data-accessible={accessible}
      data-flexible-sizing={flexibleSizing}
    >
      {children}
    </div>
  );
});

describe('PopupWrapper', () => {
  const mockScreenPosition = { x: 100, y: 100 };
  const mockDimensions = { width: 300, height: 400 };
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <ApplicationContextProvider>
          <PopupWrapper screenPosition={mockScreenPosition} dimensions={mockDimensions}>
            <div data-testid="child-content">Test Content</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders FantasyBorderFrame with correct props', () => {
      render(
        <ApplicationContextProvider>
          <PopupWrapper screenPosition={mockScreenPosition} dimensions={mockDimensions}>
            <div>Content</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      const frame = screen.getByTestId('fantasy-border-frame');
      expect(frame).toBeInTheDocument();
      expect(frame).toHaveAttribute('data-x', '100');
      expect(frame).toHaveAttribute('data-y', '100');
      expect(frame).toHaveAttribute('data-width', '300');
      expect(frame).toHaveAttribute('data-height', '400');
      expect(frame).toHaveAttribute('data-tile-width', '20');
      expect(frame).toHaveAttribute('data-tile-height', '70');
      expect(frame).toHaveAttribute('data-accessible', 'true');
      expect(frame).toHaveAttribute('data-flexible-sizing', 'true');
    });

    it('renders with accessible set to false when provided', () => {
      render(
        <ApplicationContextProvider>
          <PopupWrapper
            screenPosition={mockScreenPosition}
            dimensions={mockDimensions}
            accessible={false}
          >
            <div>Content</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      const frame = screen.getByTestId('fantasy-border-frame');
      expect(frame).toHaveAttribute('data-accessible', 'false');
    });

    it('defaults accessible to true when not provided', () => {
      render(
        <ApplicationContextProvider>
          <PopupWrapper screenPosition={mockScreenPosition} dimensions={mockDimensions}>
            <div>Content</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      const frame = screen.getByTestId('fantasy-border-frame');
      expect(frame).toHaveAttribute('data-accessible', 'true');
    });
  });

  describe('Click Outside Behavior', () => {
    it('calls onClose when clicking outside popup with custom onClose handler', () => {
      render(
        <ApplicationContextProvider>
          <PopupWrapper
            screenPosition={mockScreenPosition}
            dimensions={mockDimensions}
            onClose={mockOnClose}
          >
            <div data-testid="popup-content">Popup Content</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      // Click outside the popup
      fireEvent.mouseDown(document.body);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when clicking inside popup', () => {
      render(
        <ApplicationContextProvider>
          <PopupWrapper
            screenPosition={mockScreenPosition}
            dimensions={mockDimensions}
            onClose={mockOnClose}
          >
            <div data-testid="popup-content">Popup Content</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      const popupContent = screen.getByTestId('popup-content');
      fireEvent.mouseDown(popupContent);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('uses fallback behavior when onClose is not provided', () => {
      // This tests that the component doesn't crash without onClose
      render(
        <ApplicationContextProvider>
          <PopupWrapper screenPosition={mockScreenPosition} dimensions={mockDimensions}>
            <div data-testid="popup-content">Popup Content</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      // Should not throw when clicking outside
      expect(() => {
        fireEvent.mouseDown(document.body);
      }).not.toThrow();
    });
  });

  describe('Keyboard Events', () => {
    it('calls onClose when Escape key is pressed with custom onClose handler', () => {
      render(
        <ApplicationContextProvider>
          <PopupWrapper
            screenPosition={mockScreenPosition}
            dimensions={mockDimensions}
            onClose={mockOnClose}
          >
            <div>Popup Content</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when other keys are pressed', () => {
      render(
        <ApplicationContextProvider>
          <PopupWrapper
            screenPosition={mockScreenPosition}
            dimensions={mockDimensions}
            onClose={mockOnClose}
          >
            <div>Popup Content</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });
      fireEvent.keyDown(document, { key: 'Tab' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('uses fallback behavior when Escape is pressed without onClose', () => {
      render(
        <ApplicationContextProvider>
          <PopupWrapper screenPosition={mockScreenPosition} dimensions={mockDimensions}>
            <div>Popup Content</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      // Should not throw when pressing Escape
      expect(() => {
        fireEvent.keyDown(document, { key: 'Escape' });
      }).not.toThrow();
    });
  });

  describe('Event Listeners Cleanup', () => {
    it('removes event listeners on unmount', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = render(
        <ApplicationContextProvider>
          <PopupWrapper
            screenPosition={mockScreenPosition}
            dimensions={mockDimensions}
            onClose={mockOnClose}
          >
            <div>Popup Content</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      // Verify listeners were added
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      unmount();

      // Verify listeners were removed
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Different Screen Positions and Dimensions', () => {
    it('renders with different screen position', () => {
      const customPosition = { x: 250, y: 350 };

      render(
        <ApplicationContextProvider>
          <PopupWrapper screenPosition={customPosition} dimensions={mockDimensions}>
            <div>Content</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      const frame = screen.getByTestId('fantasy-border-frame');
      expect(frame).toHaveAttribute('data-x', '250');
      expect(frame).toHaveAttribute('data-y', '350');
    });

    it('renders with different dimensions', () => {
      const customDimensions = { width: 500, height: 600 };

      render(
        <ApplicationContextProvider>
          <PopupWrapper screenPosition={mockScreenPosition} dimensions={customDimensions}>
            <div>Content</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      const frame = screen.getByTestId('fantasy-border-frame');
      expect(frame).toHaveAttribute('data-width', '500');
      expect(frame).toHaveAttribute('data-height', '600');
    });

    it('renders with zero coordinates', () => {
      const zeroPosition = { x: 0, y: 0 };

      render(
        <ApplicationContextProvider>
          <PopupWrapper screenPosition={zeroPosition} dimensions={mockDimensions}>
            <div>Content</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      const frame = screen.getByTestId('fantasy-border-frame');
      expect(frame).toHaveAttribute('data-x', '0');
      expect(frame).toHaveAttribute('data-y', '0');
    });
  });

  describe('Complex Children', () => {
    it('renders multiple children correctly', () => {
      render(
        <ApplicationContextProvider>
          <PopupWrapper screenPosition={mockScreenPosition} dimensions={mockDimensions}>
            <div data-testid="child-1">Child 1</div>
            <div data-testid="child-2">Child 2</div>
            <div data-testid="child-3">Child 3</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });

    it('renders nested components correctly', () => {
      const NestedComponent = () => (
        <div data-testid="nested">
          <span>Nested Content</span>
          <button>Nested Button</button>
        </div>
      );

      render(
        <ApplicationContextProvider>
          <PopupWrapper screenPosition={mockScreenPosition} dimensions={mockDimensions}>
            <NestedComponent />
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      expect(screen.getByTestId('nested')).toBeInTheDocument();
      expect(screen.getByText('Nested Content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Nested Button' })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid click outside events', () => {
      render(
        <ApplicationContextProvider>
          <PopupWrapper
            screenPosition={mockScreenPosition}
            dimensions={mockDimensions}
            onClose={mockOnClose}
          >
            <div>Content</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      // Rapidly click outside multiple times
      fireEvent.mouseDown(document.body);
      fireEvent.mouseDown(document.body);
      fireEvent.mouseDown(document.body);

      // Should call onClose for each click
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });

    it('handles rapid Escape key presses', () => {
      render(
        <ApplicationContextProvider>
          <PopupWrapper
            screenPosition={mockScreenPosition}
            dimensions={mockDimensions}
            onClose={mockOnClose}
          >
            <div>Content</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      // Rapidly press Escape multiple times
      fireEvent.keyDown(document, { key: 'Escape' });
      fireEvent.keyDown(document, { key: 'Escape' });
      fireEvent.keyDown(document, { key: 'Escape' });

      // Should call onClose for each press
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });

    it('handles both click outside and Escape in sequence', () => {
      render(
        <ApplicationContextProvider>
          <PopupWrapper
            screenPosition={mockScreenPosition}
            dimensions={mockDimensions}
            onClose={mockOnClose}
          >
            <div>Content</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      fireEvent.mouseDown(document.body);
      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });

    it('renders empty children without crashing', () => {
      render(
        <ApplicationContextProvider>
          <PopupWrapper screenPosition={mockScreenPosition} dimensions={mockDimensions}>
            {null}
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      expect(screen.getByTestId('fantasy-border-frame')).toBeInTheDocument();
    });
  });

  describe('Integration with FantasyBorderFrame', () => {
    it('passes all required props to FantasyBorderFrame', () => {
      const screenPosition = { x: 123, y: 456 };
      const dimensions = { width: 789, height: 321 };

      render(
        <ApplicationContextProvider>
          <PopupWrapper screenPosition={screenPosition} dimensions={dimensions}>
            <div>Content</div>
          </PopupWrapper>
        </ApplicationContextProvider>
      );

      const frame = screen.getByTestId('fantasy-border-frame');
      expect(frame).toHaveAttribute('data-x', '123');
      expect(frame).toHaveAttribute('data-y', '456');
      expect(frame).toHaveAttribute('data-width', '789');
      expect(frame).toHaveAttribute('data-height', '321');
      expect(frame).toHaveAttribute('data-tile-width', '20');
      expect(frame).toHaveAttribute('data-tile-height', '70');
      expect(frame).toHaveAttribute('data-flexible-sizing', 'true');
    });
  });
});
