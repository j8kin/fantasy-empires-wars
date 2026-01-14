import React from 'react';
import { render, screen } from '@testing-library/react';
import RealmEventsPopup from '../../../ux-components/popups/RealmEventsPopup';

import { ApplicationContextProvider } from '../../../contexts/ApplicationContext';
import { EmpireEventKind } from '../../../types/EmpireEvent';
import type { EmpireEvent } from '../../../types/EmpireEvent';

// Mock CSS modules
jest.mock('../../../ux-components/popups/css/HeroOutcomePopup.module.css', () => ({
  popupContent: 'mocked-popup-content',
  header: 'mocked-header',
  title: 'mocked-title',
  results: 'mocked-results',
  resultMessage: 'mocked-result-message',
}));

jest.mock('../../../ux-components/popups/css/Popup.module.css', () => ({
  popupContent: 'mocked-popup-content',
  header: 'mocked-header',
  title: 'mocked-title',
}));

// Custom wrapper to provide ApplicationContext with empire events
const renderWithEmpireEvents = (empireEvents: EmpireEvent[] | null) => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <ApplicationContextProvider>
        <div data-testid="context-wrapper">
          {React.Children.map(children, (child) =>
            React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, {}) : child
          )}
        </div>
      </ApplicationContextProvider>
    );
  };

  // Use a custom component that uses the context
  const TestComponent = () => {
    const [events] = React.useState(empireEvents);
    const [hideCallCount, setHideCallCount] = React.useState(0);

    const mockHideEmpireEvents = () => {
      setHideCallCount((prev) => prev + 1);
    };

    // Mock the context provider values
    const mockContext = {
      empireEvents: events,
      hideEmpireEvents: mockHideEmpireEvents,
    };

    // Override useApplicationContext for this test
    const originalModule = jest.requireActual('../../../contexts/ApplicationContext');
    jest.spyOn(originalModule, 'useApplicationContext').mockReturnValue({
      ...originalModule.useApplicationContext(),
      ...mockContext,
    });

    return (
      <>
        <RealmEventsPopup screenPosition={{ x: 100, y: 100 }} />
        <div data-testid="hide-call-count">{hideCallCount}</div>
      </>
    );
  };

  return render(
    <TestWrapper>
      <TestComponent />
    </TestWrapper>
  );
};

describe('RealmEventsPopup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering behavior', () => {
    it('renders nothing when empireEvents is null', () => {
      renderWithEmpireEvents(null);
      expect(screen.queryByText('Echoes of the Realm')).not.toBeInTheDocument();
    });

    it('renders nothing when empireEvents is an empty array', () => {
      renderWithEmpireEvents([]);
      expect(screen.queryByText('Echoes of the Realm')).not.toBeInTheDocument();
    });

    it('renders popup when empireEvents has at least one event', () => {
      const events: EmpireEvent[] = [{ status: EmpireEventKind.Success, message: 'Your quest was successful!' }];
      renderWithEmpireEvents(events);
      expect(screen.getByText('Echoes of the Realm')).toBeInTheDocument();
    });
  });

  describe('Event status colors', () => {
    it('displays negative event with red border color', () => {
      const events: EmpireEvent[] = [{ status: EmpireEventKind.Negative, message: 'Your hero has fallen in battle!' }];
      renderWithEmpireEvents(events);

      const messageElement = screen.getByText('Your hero has fallen in battle!');
      expect(messageElement).toHaveStyle({ borderLeftColor: '#ff0000' });
    });

    it('displays success event with green border color', () => {
      const events: EmpireEvent[] = [{ status: EmpireEventKind.Success, message: 'Quest completed successfully!' }];
      renderWithEmpireEvents(events);

      const messageElement = screen.getByText('Quest completed successfully!');
      expect(messageElement).toHaveStyle({ borderLeftColor: '#2fd700' });
    });

    it('displays neutral event with gray border color', () => {
      const events: EmpireEvent[] = [{ status: EmpireEventKind.Neutral, message: 'Nothing of interest happened.' }];
      renderWithEmpireEvents(events);

      const messageElement = screen.getByText('Nothing of interest happened.');
      expect(messageElement).toHaveStyle({ borderLeftColor: '#555555' });
    });

    it('displays minor event with orange border color', () => {
      const events: EmpireEvent[] = [{ status: EmpireEventKind.Minor, message: 'Found a small amount of gold.' }];
      renderWithEmpireEvents(events);

      const messageElement = screen.getByText('Found a small amount of gold.');
      expect(messageElement).toHaveStyle({ borderLeftColor: '#ffa500' });
    });

    it('displays positive event with blue border color', () => {
      const events: EmpireEvent[] = [{ status: EmpireEventKind.Positive, message: 'Discovered a valuable artifact!' }];
      renderWithEmpireEvents(events);

      const messageElement = screen.getByText('Discovered a valuable artifact!');
      expect(messageElement).toHaveStyle({ borderLeftColor: '#4169E1' });
    });

    it('displays legendary event with purple border color', () => {
      const events: EmpireEvent[] = [
        { status: EmpireEventKind.Legendary, message: 'Found the legendary sword of power!' },
      ];
      renderWithEmpireEvents(events);

      const messageElement = screen.getByText('Found the legendary sword of power!');
      expect(messageElement).toHaveStyle({ borderLeftColor: '#6A0DAD' });
    });
  });

  describe('Multiple events display', () => {
    it('displays all events when multiple events are present', () => {
      const events: EmpireEvent[] = [
        { status: EmpireEventKind.Success, message: 'First event succeeded!' },
        { status: EmpireEventKind.Negative, message: 'Second event failed!' },
        { status: EmpireEventKind.Neutral, message: 'Third event was neutral.' },
      ];
      renderWithEmpireEvents(events);

      expect(screen.getByText('First event succeeded!')).toBeInTheDocument();
      expect(screen.getByText('Second event failed!')).toBeInTheDocument();
      expect(screen.getByText('Third event was neutral.')).toBeInTheDocument();
    });

    it('displays events with correct border colors when multiple events have different statuses', () => {
      const events: EmpireEvent[] = [
        { status: EmpireEventKind.Success, message: 'Success message' },
        { status: EmpireEventKind.Negative, message: 'Negative message' },
        { status: EmpireEventKind.Legendary, message: 'Legendary message' },
      ];
      renderWithEmpireEvents(events);

      expect(screen.getByText('Success message')).toHaveStyle({ borderLeftColor: '#2fd700' });
      expect(screen.getByText('Negative message')).toHaveStyle({ borderLeftColor: '#ff0000' });
      expect(screen.getByText('Legendary message')).toHaveStyle({ borderLeftColor: '#6A0DAD' });
    });

    it('displays multiple events of the same status type', () => {
      const events: EmpireEvent[] = [
        { status: EmpireEventKind.Success, message: 'First successful quest' },
        { status: EmpireEventKind.Success, message: 'Second successful quest' },
        { status: EmpireEventKind.Success, message: 'Third successful quest' },
      ];
      renderWithEmpireEvents(events);

      expect(screen.getByText('First successful quest')).toBeInTheDocument();
      expect(screen.getByText('Second successful quest')).toBeInTheDocument();
      expect(screen.getByText('Third successful quest')).toBeInTheDocument();
    });
  });

  describe('Message length and height calculation', () => {
    it('displays short messages correctly', () => {
      const events: EmpireEvent[] = [{ status: EmpireEventKind.Success, message: 'Short!' }];
      renderWithEmpireEvents(events);

      expect(screen.getByText('Short!')).toBeInTheDocument();
    });

    it('displays long messages correctly', () => {
      const longMessage =
        'This is a very long message that contains a lot of text to test how the popup handles longer messages. It should wrap properly and calculate the correct height for the popup window.';
      const events: EmpireEvent[] = [{ status: EmpireEventKind.Success, message: longMessage }];
      renderWithEmpireEvents(events);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('displays very long messages that would exceed maximum height', () => {
      const veryLongMessage =
        'A'.repeat(500) +
        ' This message is extremely long and should test the maximum height constraint of the popup window. ' +
        'B'.repeat(500);
      const events: EmpireEvent[] = [{ status: EmpireEventKind.Success, message: veryLongMessage }];
      renderWithEmpireEvents(events);

      expect(screen.getByText(veryLongMessage)).toBeInTheDocument();
    });

    it('handles multiple long messages and calculates correct total height', () => {
      const longMessage1 = 'First long message: ' + 'A'.repeat(200) + ' - This should contribute to the total height.';
      const longMessage2 = 'Second long message: ' + 'B'.repeat(200) + ' - This also contributes to the total height.';
      const longMessage3 = 'Third long message: ' + 'C'.repeat(200) + ' - And this one as well for testing.';

      const events: EmpireEvent[] = [
        { status: EmpireEventKind.Success, message: longMessage1 },
        { status: EmpireEventKind.Negative, message: longMessage2 },
        { status: EmpireEventKind.Neutral, message: longMessage3 },
      ];
      renderWithEmpireEvents(events);

      expect(screen.getByText(longMessage1)).toBeInTheDocument();
      expect(screen.getByText(longMessage2)).toBeInTheDocument();
      expect(screen.getByText(longMessage3)).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles event with empty message string', () => {
      const events: EmpireEvent[] = [{ status: EmpireEventKind.Success, message: '' }];
      renderWithEmpireEvents(events);

      expect(screen.getByText('Echoes of the Realm')).toBeInTheDocument();
    });

    it('handles events with special characters in messages', () => {
      const events: EmpireEvent[] = [
        {
          status: EmpireEventKind.Success,
          message: 'Test <>&"\' special chars & symbols!@#$%^&*()',
        },
      ];
      renderWithEmpireEvents(events);

      expect(screen.getByText('Test <>&"\' special chars & symbols!@#$%^&*()')).toBeInTheDocument();
    });

    it('handles events with newline characters in messages', () => {
      const events: EmpireEvent[] = [{ status: EmpireEventKind.Success, message: 'Line 1\nLine 2\nLine 3' }];
      renderWithEmpireEvents(events);

      // Newlines are rendered as actual line breaks in HTML, so use a regex matcher
      expect(screen.getByText(/Line 1\s+Line 2\s+Line 3/)).toBeInTheDocument();
    });

    it('handles large number of events', () => {
      const events: EmpireEvent[] = Array.from({ length: 20 }, (_, i) => ({
        status: EmpireEventKind.Success,
        message: `Event number ${i + 1}`,
      }));
      renderWithEmpireEvents(events);

      expect(screen.getByText('Event number 1')).toBeInTheDocument();
      expect(screen.getByText('Event number 10')).toBeInTheDocument();
      expect(screen.getByText('Event number 20')).toBeInTheDocument();
    });
  });

  describe('Minimum height constraint', () => {
    it('maintains minimum height of 150px even with very short messages', () => {
      const events: EmpireEvent[] = [{ status: EmpireEventKind.Success, message: 'Hi' }];
      renderWithEmpireEvents(events);

      // The popup should be rendered with the header visible
      expect(screen.getByText('Echoes of the Realm')).toBeInTheDocument();
      expect(screen.getByText('Hi')).toBeInTheDocument();
    });

    it('maintains minimum height with single short event', () => {
      const events: EmpireEvent[] = [{ status: EmpireEventKind.Success, message: 'X' }];
      renderWithEmpireEvents(events);

      expect(screen.getByText('Echoes of the Realm')).toBeInTheDocument();
      expect(screen.getByText('X')).toBeInTheDocument();
    });
  });

  describe('Maximum height constraint', () => {
    it('caps height at 498px when content would exceed this limit', () => {
      // Create enough events to exceed the maximum height
      const events: EmpireEvent[] = Array.from({ length: 15 }, (_, i) => ({
        status: EmpireEventKind.Success,
        message: `Very long event message ${i + 1}: ${'A'.repeat(150)}`,
      }));
      renderWithEmpireEvents(events);

      expect(screen.getByText('Echoes of the Realm')).toBeInTheDocument();
      // First and last messages should still be in the document (scrollable)
      expect(screen.getByText(/Very long event message 1:/)).toBeInTheDocument();
    });
  });

  describe('Mixed event scenarios', () => {
    it('displays all event types in a single popup', () => {
      const events: EmpireEvent[] = [
        { status: EmpireEventKind.Negative, message: 'Negative outcome' },
        { status: EmpireEventKind.Success, message: 'Success outcome' },
        { status: EmpireEventKind.Neutral, message: 'Neutral outcome' },
        { status: EmpireEventKind.Minor, message: 'Minor outcome' },
        { status: EmpireEventKind.Positive, message: 'Positive outcome' },
        { status: EmpireEventKind.Legendary, message: 'Legendary outcome' },
      ];
      renderWithEmpireEvents(events);

      expect(screen.getByText('Negative outcome')).toBeInTheDocument();
      expect(screen.getByText('Success outcome')).toBeInTheDocument();
      expect(screen.getByText('Neutral outcome')).toBeInTheDocument();
      expect(screen.getByText('Minor outcome')).toBeInTheDocument();
      expect(screen.getByText('Positive outcome')).toBeInTheDocument();
      expect(screen.getByText('Legendary outcome')).toBeInTheDocument();
    });
  });
});
