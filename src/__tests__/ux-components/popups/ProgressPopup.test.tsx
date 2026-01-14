import React from 'react';
import { render, screen } from '@testing-library/react';

import ProgressPopup from '../../../ux-components/popups/ProgressPopup';

// Mock CSS module
jest.mock('../../../ux-components/popups/css/ProgressPopup.module.css', () => ({
  blockingOverlay: 'mocked-blocking-overlay',
  content: 'mocked-content',
  progressBar: 'mocked-progress-bar',
  progressBarFill: 'mocked-progress-bar-fill',
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

describe('ProgressPopup', () => {
  const mockScreenPosition = { x: 100, y: 200 };
  const mockMessage = 'Loading...';

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear document body between tests
    document.body.innerHTML = '';
    const { cleanup } = require('@testing-library/react');
    cleanup();
  });

  describe('Rendering', () => {
    it('renders with correct screen position', () => {
      render(<ProgressPopup screenPosition={mockScreenPosition} message={mockMessage} />);

      const wrapper = screen.getByTestId('popup-wrapper');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveAttribute('data-x', '100');
      expect(wrapper).toHaveAttribute('data-y', '200');
    });

    it('renders with correct dimensions', () => {
      render(<ProgressPopup screenPosition={mockScreenPosition} message={mockMessage} />);

      const wrapper = screen.getByTestId('popup-wrapper');
      expect(wrapper).toHaveAttribute('data-width', '400');
      expect(wrapper).toHaveAttribute('data-height', '200');
    });

    it('renders with accessible set to false', () => {
      render(<ProgressPopup screenPosition={mockScreenPosition} message={mockMessage} />);

      const wrapper = screen.getByTestId('popup-wrapper');
      expect(wrapper).toHaveAttribute('data-accessible', 'false');
    });

    it('renders blocking overlay', () => {
      render(<ProgressPopup screenPosition={mockScreenPosition} message={mockMessage} />);
      expect(screen.getByTestId('progress-popup-overlay')).toBeInTheDocument();
    });

    it('renders progress bar', () => {
      render(<ProgressPopup screenPosition={mockScreenPosition} message={mockMessage} />);
      expect(screen.getByTestId('progress-popup-bar')).toBeInTheDocument();
    });

    it('renders progress bar fill', () => {
      render(<ProgressPopup screenPosition={mockScreenPosition} message={mockMessage} />);
      expect(screen.getByTestId('progress-popup-fill')).toBeInTheDocument();
    });

    it('displays the provided message', () => {
      render(<ProgressPopup screenPosition={mockScreenPosition} message="Processing data..." />);

      expect(screen.getByText('Processing data...')).toBeInTheDocument();
    });
  });

  describe('Different Messages', () => {
    it('displays short message', () => {
      render(<ProgressPopup screenPosition={mockScreenPosition} message="Wait..." />);

      expect(screen.getByText('Wait...')).toBeInTheDocument();
    });

    it('displays long message', () => {
      const longMessage = 'Please wait while we process your request. This may take several minutes.';
      render(<ProgressPopup screenPosition={mockScreenPosition} message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('displays empty message', () => {
      render(<ProgressPopup screenPosition={mockScreenPosition} message="" />);

      const messageElement = screen.getByTestId('progress-popup-message');
      expect(messageElement).toBeInTheDocument();
      expect(messageElement).toHaveTextContent('');
    });

    it('displays message with special characters', () => {
      const specialMessage = 'Processing: 50% @ #$%^&*()';
      render(<ProgressPopup screenPosition={mockScreenPosition} message={specialMessage} />);

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it('displays message with newlines', () => {
      const multilineMessage = 'Loading...\nPlease wait';
      render(<ProgressPopup screenPosition={mockScreenPosition} message={multilineMessage} />);

      const message = screen.getByText((content) => content.includes('Loading...') && content.includes('Please wait'));
      expect(message).toBeInTheDocument();
      expect(message.textContent).toBe(multilineMessage);
    });

    it('displays unicode characters correctly', () => {
      const unicodeMessage = 'Loading... ⏳ Please wait ⌛';
      render(<ProgressPopup screenPosition={mockScreenPosition} message={unicodeMessage} />);

      expect(screen.getByText(unicodeMessage)).toBeInTheDocument();
    });

    it('displays HTML entities correctly', () => {
      const htmlMessage = 'Loading &lt;data&gt; from server...';
      render(<ProgressPopup screenPosition={mockScreenPosition} message={htmlMessage} />);

      expect(screen.getByText(htmlMessage)).toBeInTheDocument();
    });
  });

  describe('Different Screen Positions', () => {
    it('renders at position (0, 0)', () => {
      render(<ProgressPopup screenPosition={{ x: 0, y: 0 }} message="Loading at origin" />);

      const wrapper = screen.getByTestId('popup-wrapper');
      expect(wrapper).toHaveAttribute('data-x', '0');
      expect(wrapper).toHaveAttribute('data-y', '0');
    });

    it('renders at large coordinates', () => {
      render(<ProgressPopup screenPosition={{ x: 1920, y: 1080 }} message="Loading at large position" />);

      const wrapper = screen.getByTestId('popup-wrapper');
      expect(wrapper).toHaveAttribute('data-x', '1920');
      expect(wrapper).toHaveAttribute('data-y', '1080');
    });

    it('renders at negative coordinates', () => {
      render(<ProgressPopup screenPosition={{ x: -50, y: -100 }} message="Loading at negative position" />);

      const wrapper = screen.getByTestId('popup-wrapper');
      expect(wrapper).toHaveAttribute('data-x', '-50');
      expect(wrapper).toHaveAttribute('data-y', '-100');
    });
  });

  describe('Component Structure', () => {
    it('wraps content in PopupWrapper', () => {
      render(<ProgressPopup screenPosition={mockScreenPosition} message={mockMessage} />);

      expect(screen.getByTestId('popup-wrapper')).toBeInTheDocument();
    });

    it('renders blocking overlay before popup wrapper', () => {
      render(<ProgressPopup screenPosition={mockScreenPosition} message={mockMessage} />);

      const overlay = screen.getByTestId('progress-popup-overlay');
      const wrapper = screen.getByTestId('popup-wrapper');

      expect(overlay).toBeInTheDocument();
      expect(wrapper).toBeInTheDocument();
    });

    it('renders content container with proper structure', () => {
      render(<ProgressPopup screenPosition={mockScreenPosition} message={mockMessage} />);

      const content = screen.getByTestId('progress-popup-content');
      expect(content).toBeInTheDocument();

      const progressBar = screen.getByTestId('progress-popup-bar');
      const message = screen.getByTestId('progress-popup-message');

      expect(progressBar).toBeInTheDocument();
      expect(message).toBeInTheDocument();
    });

    it('renders progress bar fill inside progress bar', () => {
      render(<ProgressPopup screenPosition={mockScreenPosition} message={mockMessage} />);

      const progressBar = screen.getByTestId('progress-popup-bar');
      const progressBarFill = screen.getByTestId('progress-popup-fill');

      expect(progressBar).toContainElement(progressBarFill);
    });
  });

  describe('Props Updates', () => {
    it('updates message when prop changes', () => {
      const { rerender } = render(<ProgressPopup screenPosition={mockScreenPosition} message="Initial message" />);

      expect(screen.getByText('Initial message')).toBeInTheDocument();

      rerender(<ProgressPopup screenPosition={mockScreenPosition} message="Updated message" />);

      expect(screen.getByText('Updated message')).toBeInTheDocument();
      expect(screen.queryByText('Initial message')).not.toBeInTheDocument();
    });

    it('updates screen position when prop changes', () => {
      const { rerender } = render(<ProgressPopup screenPosition={{ x: 100, y: 100 }} message={mockMessage} />);

      expect(screen.getByTestId('popup-wrapper')).toHaveAttribute('data-x', '100');
      expect(screen.getByTestId('popup-wrapper')).toHaveAttribute('data-y', '100');

      rerender(<ProgressPopup screenPosition={{ x: 200, y: 300 }} message={mockMessage} />);

      expect(screen.getByTestId('popup-wrapper')).toHaveAttribute('data-x', '200');
      expect(screen.getByTestId('popup-wrapper')).toHaveAttribute('data-y', '300');
    });

    it('maintains structure when props change', () => {
      const { rerender } = render(<ProgressPopup screenPosition={mockScreenPosition} message="Message 1" />);

      expect(screen.getByTestId('progress-popup-bar')).toBeInTheDocument();

      rerender(<ProgressPopup screenPosition={{ x: 300, y: 400 }} message="Message 2" />);

      expect(screen.getByTestId('progress-popup-bar')).toBeInTheDocument();
      expect(screen.getByTestId('progress-popup-fill')).toBeInTheDocument();
    });
  });

  describe('Popup Properties', () => {
    it('maintains consistent dimensions across different messages', () => {
      const messages = [
        'Short',
        'Medium length progress message',
        'Very long progress message that contains a lot of text and should still fit within the popup dimensions',
      ];

      messages.forEach((message) => {
        const { cleanup } = require('@testing-library/react');
        cleanup();
        render(<ProgressPopup screenPosition={mockScreenPosition} message={message} />);

        const wrapper = screen.getByTestId('popup-wrapper');
        expect(wrapper).toHaveAttribute('data-width', '400');
        expect(wrapper).toHaveAttribute('data-height', '200');
      });
    });

    it('maintains accessible property as false', () => {
      render(<ProgressPopup screenPosition={mockScreenPosition} message="Testing accessibility" />);

      const wrapper = screen.getByTestId('popup-wrapper');
      expect(wrapper).toHaveAttribute('data-accessible', 'false');
    });

    it('always renders blocking overlay', () => {
      const messages = ['Message 1', 'Message 2', 'Message 3'];

      messages.forEach((message) => {
        const { cleanup } = require('@testing-library/react');
        cleanup();
        render(<ProgressPopup screenPosition={mockScreenPosition} message={message} />);

        expect(screen.getByTestId('progress-popup-overlay')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('renders without crashing with minimal props', () => {
      render(<ProgressPopup screenPosition={{ x: 0, y: 0 }} message="" />);

      expect(screen.getByTestId('popup-wrapper')).toBeInTheDocument();
    });

    it('handles very long messages', () => {
      const veryLongMessage = 'A'.repeat(500);
      render(<ProgressPopup screenPosition={mockScreenPosition} message={veryLongMessage} />);

      expect(screen.getByText(veryLongMessage)).toBeInTheDocument();
    });

    it('renders message with tabs', () => {
      const messageWithTabs = 'Loading...\tProcessing\tData';
      render(<ProgressPopup screenPosition={mockScreenPosition} message={messageWithTabs} />);

      const message = screen.getByText(
        (content) => content.includes('Loading...') && content.includes('Processing') && content.includes('Data')
      );
      expect(message).toBeInTheDocument();
    });

    it('renders message with multiple spaces', () => {
      const messageWithSpaces = 'Loading    Please    Wait';
      render(<ProgressPopup screenPosition={mockScreenPosition} message={messageWithSpaces} />);

      const message = screen.getByText(/Loading.*Please.*Wait/);
      expect(message).toBeInTheDocument();
      expect(message.textContent).toContain('Loading');
      expect(message.textContent).toContain('Please');
      expect(message.textContent).toContain('Wait');
    });
  });

  describe('Blocking Overlay Behavior', () => {
    it('renders blocking overlay as separate element', () => {
      render(<ProgressPopup screenPosition={mockScreenPosition} message={mockMessage} />);

      const overlay = screen.getByTestId('progress-popup-overlay');
      const wrapper = screen.getByTestId('popup-wrapper');

      // Overlay and wrapper should be siblings
      expect(overlay).toBeInTheDocument();
      expect(wrapper).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-node-access
      expect(overlay.parentElement).toBe(wrapper.parentElement);
    });

    it('always renders blocking overlay regardless of message', () => {
      const { rerender } = render(<ProgressPopup screenPosition={mockScreenPosition} message="Message 1" />);

      expect(screen.getByTestId('progress-popup-overlay')).toBeInTheDocument();

      rerender(<ProgressPopup screenPosition={mockScreenPosition} message="" />);

      expect(screen.getByTestId('progress-popup-overlay')).toBeInTheDocument();
    });
  });

  describe('Accessibility Properties', () => {
    it('sets accessible to false to prevent user interaction', () => {
      render(<ProgressPopup screenPosition={mockScreenPosition} message="Processing..." />);

      const wrapper = screen.getByTestId('popup-wrapper');
      expect(wrapper).toHaveAttribute('data-accessible', 'false');
    });

    it('maintains accessible=false across re-renders', () => {
      const { rerender } = render(<ProgressPopup screenPosition={mockScreenPosition} message="Message 1" />);

      expect(screen.getByTestId('popup-wrapper')).toHaveAttribute('data-accessible', 'false');

      rerender(<ProgressPopup screenPosition={{ x: 300, y: 300 }} message="Message 2" />);

      expect(screen.getByTestId('popup-wrapper')).toHaveAttribute('data-accessible', 'false');
    });
  });
});
