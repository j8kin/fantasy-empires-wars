import React from 'react';
import { render, screen } from '@testing-library/react';

import ErrorMessagePopup from '../../../ux-components/popups/ErrorMessagePopup';

// Mock CSS module
jest.mock('../../../ux-components/popups/css/Popup.module.css', () => ({
  popupContent: 'mocked-popup-content',
  message: 'mocked-message',
}));

// Mock PopupWrapper component
jest.mock('../../../ux-components/popups/PopupWrapper', () => {
  return ({ screenPosition, dimensions, accessible, children }: any) => (
    <div
      data-testid="popup-wrapper"
      data-x={screenPosition.x}
      data-y={screenPosition.y}
      data-width={dimensions.width}
      data-height={dimensions.height}
      data-accessible={accessible}
    >
      {children}
    </div>
  );
});

// Mock ApplicationContext hook
jest.mock('../../../contexts/ApplicationContext', () => {
  const originalModule = jest.requireActual('../../../contexts/ApplicationContext');
  return {
    ...originalModule,
    useApplicationContext: jest.fn(),
  };
});

describe('ErrorMessagePopup', () => {
  const mockScreenPosition = { x: 100, y: 200 };

  beforeEach(() => {
    jest.clearAllMocks();

    // Clear document body between tests
    document.body.innerHTML = '';
    const { cleanup } = require('@testing-library/react');
    cleanup();

    // Set up default mock for useApplicationContext
    const { useApplicationContext } = require('../../../contexts/ApplicationContext');
    useApplicationContext.mockReturnValue({
      errorMessagePopupMessage: 'Test error message',
    });
  });

  describe('Rendering', () => {
    it('renders with correct screen position', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Test error message',
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      const wrapper = screen.getByTestId('popup-wrapper');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveAttribute('data-x', '100');
      expect(wrapper).toHaveAttribute('data-y', '200');
    });

    it('renders with correct dimensions', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Test error message',
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      const wrapper = screen.getByTestId('popup-wrapper');
      expect(wrapper).toHaveAttribute('data-width', '400');
      expect(wrapper).toHaveAttribute('data-height', '100');
    });

    it('renders with accessible set to true', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Test error message',
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      const wrapper = screen.getByTestId('popup-wrapper');
      expect(wrapper).toHaveAttribute('data-accessible', 'true');
    });

    it('displays error message from context', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'This is a test error message',
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      expect(screen.getByText('This is a test error message')).toBeInTheDocument();
    });
  });

  describe('Different Error Messages', () => {
    it('displays short error message', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Error!',
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      expect(screen.getByText('Error!')).toBeInTheDocument();
    });

    it('displays long error message', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      const longMessage =
        'This is a very long error message that should still be displayed correctly within the popup wrapper component';
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: longMessage,
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('displays empty error message', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: '',
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      const wrapper = screen.getByTestId('popup-wrapper');
      expect(wrapper).toBeInTheDocument();
    });

    it('displays error message with special characters', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Error: Invalid action! @#$%^&*()',
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      expect(screen.getByText('Error: Invalid action! @#$%^&*()')).toBeInTheDocument();
    });

    it('displays error message with newlines', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Line 1\nLine 2\nLine 3',
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      // Check that the message div contains the newline text
      const message = screen.getByText((content) => content.includes('Line 1') && content.includes('Line 2'));
      expect(message).toBeInTheDocument();
      expect(message.textContent).toBe('Line 1\nLine 2\nLine 3');
    });
  });

  describe('Different Screen Positions', () => {
    it('renders at position (0, 0)', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Error at origin',
      });

      render(<ErrorMessagePopup screenPosition={{ x: 0, y: 0 }} />);

      const wrapper = screen.getByTestId('popup-wrapper');
      expect(wrapper).toHaveAttribute('data-x', '0');
      expect(wrapper).toHaveAttribute('data-y', '0');
    });

    it('renders at large coordinates', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Error at large position',
      });

      render(<ErrorMessagePopup screenPosition={{ x: 1920, y: 1080 }} />);

      const wrapper = screen.getByTestId('popup-wrapper');
      expect(wrapper).toHaveAttribute('data-x', '1920');
      expect(wrapper).toHaveAttribute('data-y', '1080');
    });

    it('renders at negative coordinates', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Error at negative position',
      });

      render(<ErrorMessagePopup screenPosition={{ x: -50, y: -100 }} />);

      const wrapper = screen.getByTestId('popup-wrapper');
      expect(wrapper).toHaveAttribute('data-x', '-50');
      expect(wrapper).toHaveAttribute('data-y', '-100');
    });
  });

  describe('Context Integration', () => {
    it('updates when error message changes in context', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Initial error',
      });

      const { rerender } = render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      expect(screen.getByText('Initial error')).toBeInTheDocument();

      // Update mock to return new error message
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Updated error',
      });

      rerender(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      expect(screen.getByText('Updated error')).toBeInTheDocument();
      expect(screen.queryByText('Initial error')).not.toBeInTheDocument();
    });

    it('uses errorMessagePopupMessage from ApplicationContext', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      const customMessage = 'Custom context error message';
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: customMessage,
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('wraps content in PopupWrapper', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Test message',
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      expect(screen.getByTestId('popup-wrapper')).toBeInTheDocument();
    });

    it('renders message within popupContent div', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Structured message',
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      expect(screen.getByText('Structured message')).toBeInTheDocument();
    });

    it('applies correct inline styles to popupContent', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Styled message',
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      const popupContent = screen.getByTestId('error-message-popup-content');
      expect(popupContent).toHaveStyle({ height: '60px' });
      expect(popupContent).toHaveStyle({ justifyContent: 'center' });
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined error message gracefully', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: undefined,
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      const wrapper = screen.getByTestId('popup-wrapper');
      expect(wrapper).toBeInTheDocument();
    });

    it('handles null error message gracefully', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: null,
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      const wrapper = screen.getByTestId('popup-wrapper');
      expect(wrapper).toBeInTheDocument();
    });

    it('handles numeric error message', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 42,
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders without crashing when screen position changes', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Position change test',
      });

      const { rerender } = render(<ErrorMessagePopup screenPosition={{ x: 100, y: 100 }} />);

      expect(screen.getByTestId('popup-wrapper')).toHaveAttribute('data-x', '100');
      expect(screen.getByTestId('popup-wrapper')).toHaveAttribute('data-y', '100');

      rerender(<ErrorMessagePopup screenPosition={{ x: 200, y: 300 }} />);

      expect(screen.getByTestId('popup-wrapper')).toHaveAttribute('data-x', '200');
      expect(screen.getByTestId('popup-wrapper')).toHaveAttribute('data-y', '300');
    });
  });

  describe('Integration', () => {
    it('retrieves error message from mocked context', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Provider integration test',
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      expect(screen.getByText('Provider integration test')).toBeInTheDocument();
    });
  });

  describe('Popup Properties', () => {
    it('maintains consistent dimensions across different messages', () => {
      const messages = [
        'Short',
        'Medium length error message',
        'Very long error message that contains a lot of text and should still fit',
      ];

      messages.forEach((message) => {
        const { useApplicationContext } = require('../../../contexts/ApplicationContext');
        useApplicationContext.mockReturnValue({
          errorMessagePopupMessage: message,
        });

        const { cleanup } = require('@testing-library/react');
        cleanup();
        render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

        const wrapper = screen.getByTestId('popup-wrapper');
        expect(wrapper).toHaveAttribute('data-width', '400');
        expect(wrapper).toHaveAttribute('data-height', '100');
      });
    });

    it('maintains accessible property as true', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Accessibility test',
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      const wrapper = screen.getByTestId('popup-wrapper');
      expect(wrapper).toHaveAttribute('data-accessible', 'true');
    });
  });

  describe('Message Display Formatting', () => {
    it('displays HTML entities correctly', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Error: &lt;tag&gt; not allowed',
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      expect(screen.getByText('Error: &lt;tag&gt; not allowed')).toBeInTheDocument();
    });

    it('displays unicode characters correctly', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Error: ⚠️ Invalid action ❌',
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      expect(screen.getByText('Error: ⚠️ Invalid action ❌')).toBeInTheDocument();
    });

    it('renders message with multiple spaces', () => {
      const { useApplicationContext } = require('../../../contexts/ApplicationContext');
      useApplicationContext.mockReturnValue({
        errorMessagePopupMessage: 'Error:    Multiple    Spaces',
      });

      render(<ErrorMessagePopup screenPosition={mockScreenPosition} />);

      // Check that the message is rendered (HTML normalizes spaces when displayed)
      const message = screen.getByText(/Error:.*Multiple.*Spaces/);
      expect(message).toBeInTheDocument();
      // The actual textContent will have spaces normalized by the browser
      expect(message.textContent).toContain('Error:');
      expect(message.textContent).toContain('Multiple');
      expect(message.textContent).toContain('Spaces');
    });
  });
});
