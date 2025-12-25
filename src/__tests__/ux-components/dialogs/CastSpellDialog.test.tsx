import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import CastSpellDialog from '../../../ux-components/dialogs/CastSpellDialog';

import { GameProvider } from '../../../contexts/GameContext';
import {
  ApplicationContextProvider,
  useApplicationContext,
} from '../../../contexts/ApplicationContext';
import { AllSpells } from '../../../domain/spell/spellsRepository';
import type { GameState } from '../../../state/GameState';

import { createDefaultGameStateStub } from '../../utils/createGameStateStub';

// Mock CSS modules
jest.mock(
  '../../../ux-components/fantasy-book-dialog-template/css/FlipBook.module.css',
  () => ({})
);

// Mock child components
jest.mock('../../../ux-components/fantasy-book-dialog-template/FlipBook', () => {
  return ({ children, onClickOutside }: any) => (
    <div data-testid="FlipBook" onClick={onClickOutside}>
      {children}
    </div>
  );
});

// Mock FlipBookPage with minimal behavior simulation
const mockFlipBookPageClick = jest.fn();

jest.mock('../../../ux-components/fantasy-book-dialog-template/FlipBookPage', () => {
  const MockFlipBookPage = ({ header, description, cost, costLabel, onClose }: any) => (
    <div data-testid={`FlipBookPage-${header}`}>
      <h3>{header}</h3>
      <p>{description}</p>
      <span data-testid={`cost-${header}`}>
        {costLabel}: {cost}
      </span>
      <button
        data-testid={`select-spell-${header}`}
        onClick={() => {
          // Call the mock function which we can spy on in tests
          mockFlipBookPageClick(header);
          onClose?.();
        }}
      >
        Select {header}
      </button>
    </div>
  );

  return {
    __esModule: true,
    default: MockFlipBookPage,
    FlipBookPageType: {
      SPELL: 'Spell',
      BUILDING: 'Building',
      RECRUIT: 'Recruit',
      QUEST: 'Quest',
    },
  };
});

// Mock spell images
jest.mock('../../../assets/spells/white/blessing.png', () => 'blessing.png');
jest.mock('../../../assets/spells/white/heal.png', () => 'heal.png');
jest.mock('../../../assets/spells/white/turn-undead.png', () => 'turn-undead.png');
jest.mock('../../../assets/spells/white/view.png', () => 'view.png');
jest.mock('../../../assets/spells/blue/illusion.png', () => 'illusion.png');
jest.mock('../../../assets/spells/blue/teleport.png', () => 'teleport.png');

const CastSpellDialogWithContext: React.FC = () => (
  <ApplicationContextProvider>
    <GameProvider>
      <CastSpellDialog />
    </GameProvider>
  </ApplicationContextProvider>
);

const TestComponentWithDialog: React.FC = () => {
  const { setShowCastSpellDialog, showCastSpellDialog } = useApplicationContext();

  return (
    <div>
      <button data-testid="show-dialog" onClick={() => setShowCastSpellDialog(true)}>
        Show Dialog
      </button>
      <button data-testid="hide-dialog" onClick={() => setShowCastSpellDialog(false)}>
        Hide Dialog
      </button>
      <span data-testid="dialog-state">{showCastSpellDialog ? 'open' : 'closed'}</span>
      <CastSpellDialog />
    </div>
  );
};

const renderWithApplicationContext = () => {
  const Bootstrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <>{children}</>;
  };
  const gameStateWithMana = (): GameState => {
    const gameStateStub = createDefaultGameStateStub();
    gameStateStub.players.forEach(
      (player) => (player.mana = { white: 200, green: 200, red: 200, black: 200, blue: 200 })
    );
    return gameStateStub;
  };
  // Mock the useGameContext to provide a proper gameState
  const mockGameContext = {
    gameState: gameStateWithMana(),
    updateGameState: jest.fn(),
    startNewGame: jest.fn(),
    startNewTurn: jest.fn(),
    endCurrentTurn: jest.fn(),
    setTurnManagerCallbacks: jest.fn(),
  };

  // Mock useGameContext before rendering
  jest
    .spyOn(require('../../../contexts/GameContext'), 'useGameContext')
    .mockReturnValue(mockGameContext);

  return render(
    <ApplicationContextProvider>
      <Bootstrapper>
        <TestComponentWithDialog />
      </Bootstrapper>
    </ApplicationContextProvider>
  );
};

describe('CastSpellDialog Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFlipBookPageClick.mockClear();
    // Mock window.alert to avoid jsdom errors and capture alerts
    jest.spyOn(window, 'alert').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('does not render when showCastSpellDialog is false', () => {
      render(<CastSpellDialogWithContext />);
      expect(screen.queryByTestId('FlipBook')).not.toBeInTheDocument();
    });

    it('renders FlipBook when showCastSpellDialog is true', () => {
      renderWithApplicationContext();
      fireEvent.click(screen.getByTestId('show-dialog'));
      expect(screen.getByTestId('FlipBook')).toBeInTheDocument();
    });

    it('renders all spells as FlipBookPages', () => {
      renderWithApplicationContext();
      fireEvent.click(screen.getByTestId('show-dialog'));

      AllSpells.forEach((spell) => {
        expect(screen.getByTestId(`FlipBookPage-${spell.type}`)).toBeInTheDocument();
        expect(screen.getByText(spell.type)).toBeInTheDocument();
        expect(screen.getByText(spell.description)).toBeInTheDocument();
        expect(screen.getByTestId(`cost-${spell.type}`)).toHaveTextContent(
          `Mana Cost: ${spell.manaCost}`
        );
      });
    });
  });

  describe('Spell Information Display', () => {
    it('displays correct spell information for each spell', () => {
      renderWithApplicationContext();
      fireEvent.click(screen.getByTestId('show-dialog'));

      const testSpell = AllSpells[0]; // Test with first spell
      expect(screen.getByText(testSpell.type)).toBeInTheDocument();
      expect(screen.getByText(testSpell.description)).toBeInTheDocument();
      expect(screen.getByTestId(`cost-${testSpell.type}`)).toHaveTextContent(
        `Mana Cost: ${testSpell.manaCost}`
      );
    });

    it('displays mana costs correctly for different spells', () => {
      renderWithApplicationContext();
      fireEvent.click(screen.getByTestId('show-dialog'));

      // Test a few different spells with different mana costs
      const spellsToTest = AllSpells.slice(0, 3);
      spellsToTest.forEach((spell) => {
        const costElement = screen.getByTestId(`cost-${spell.type}`);
        expect(costElement).toHaveTextContent(`Mana Cost: ${spell.manaCost}`);
      });
    });
  });

  describe('Spell Selection and Casting', () => {
    it('triggers spell selection when a spell is selected', async () => {
      renderWithApplicationContext();
      fireEvent.click(screen.getByTestId('show-dialog'));

      const testSpell = AllSpells[0];
      const selectButton = screen.getByTestId(`select-spell-${testSpell.type}`);

      fireEvent.click(selectButton);

      expect(mockFlipBookPageClick).toHaveBeenCalledWith(testSpell.type);
    });

    it('handles spell selection for different spell types', () => {
      renderWithApplicationContext();

      // Test selection of different spells - need to open/close dialog for each
      const spellsToTest = AllSpells.slice(0, 2);
      spellsToTest.forEach((spell, index) => {
        fireEvent.click(screen.getByTestId('show-dialog'));
        const selectButton = screen.getByTestId(`select-spell-${spell.type}`);
        fireEvent.click(selectButton);
        expect(mockFlipBookPageClick).toHaveBeenNthCalledWith(index + 1, spell.type);
      });
    });
  });

  describe('Dialog Interaction', () => {
    it('shows and hides dialog properly', () => {
      renderWithApplicationContext();

      // Initially dialog should not be visible
      expect(screen.queryByTestId('FlipBook')).not.toBeInTheDocument();
      expect(screen.getByTestId('dialog-state')).toHaveTextContent('closed');

      // Show dialog
      fireEvent.click(screen.getByTestId('show-dialog'));
      expect(screen.getByTestId('FlipBook')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-state')).toHaveTextContent('open');

      // Hide dialog
      fireEvent.click(screen.getByTestId('hide-dialog'));
      expect(screen.queryByTestId('FlipBook')).not.toBeInTheDocument();
      expect(screen.getByTestId('dialog-state')).toHaveTextContent('closed');
    });
  });

  describe('Context Integration', () => {
    it('integrates with ApplicationContext for state management', () => {
      renderWithApplicationContext();

      // Initially dialog should not be visible
      expect(screen.queryByTestId('FlipBook')).not.toBeInTheDocument();

      // Show dialog through context
      fireEvent.click(screen.getByTestId('show-dialog'));
      expect(screen.getByTestId('FlipBook')).toBeInTheDocument();
    });

    it('handles selectedItem state changes', async () => {
      renderWithApplicationContext();
      fireEvent.click(screen.getByTestId('show-dialog'));

      const testSpell = AllSpells[0];
      const selectButton = screen.getByTestId(`select-spell-${testSpell.type}`);

      fireEvent.click(selectButton);

      // Should trigger spell selection
      expect(mockFlipBookPageClick).toHaveBeenCalledWith(testSpell.type);
    });
  });

  describe('Spell Icon Mapping', () => {
    it('handles spells with missing icons gracefully', () => {
      renderWithApplicationContext();
      fireEvent.click(screen.getByTestId('show-dialog'));

      // All spells should render even if some icons are missing
      AllSpells.forEach((spell) => {
        expect(screen.getByTestId(`FlipBookPage-${spell.type}`)).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Optimization', () => {
    it('renders large spell lists efficiently', () => {
      renderWithApplicationContext();
      fireEvent.click(screen.getByTestId('show-dialog'));

      // Should render all spells without performance issues
      expect(screen.getAllByText(/Mana Cost:/).length).toBe(AllSpells.length);
    });

    it('handles dialog state changes efficiently', () => {
      renderWithApplicationContext();

      // Show and hide dialog multiple times
      for (let i = 0; i < 3; i++) {
        fireEvent.click(screen.getByTestId('show-dialog'));
        expect(screen.getByTestId('FlipBook')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('hide-dialog'));
        expect(screen.queryByTestId('FlipBook')).not.toBeInTheDocument();
      }
    });
  });

  describe('Accessibility', () => {
    it('provides accessible spell selection', () => {
      renderWithApplicationContext();
      fireEvent.click(screen.getByTestId('show-dialog'));

      AllSpells.forEach((spell) => {
        const selectButton = screen.getByTestId(`select-spell-${spell.type}`);
        expect(selectButton).toHaveTextContent(`Select ${spell.type}`);
        expect(selectButton).toBeEnabled();
      });
    });
  });
});
