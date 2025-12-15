import React from 'react';
import { render, screen } from '@testing-library/react';
import { ApplicationContextProvider } from '../../../contexts/ApplicationContext';
import LandInfoPopup from '../../../ux-components/popups/LandInfoPopup';

import { GameState } from '../../../state/GameState';
import { LandState } from '../../../state/map/land/LandState';
import { Armies } from '../../../state/army/ArmyState';
import { getLandId } from '../../../state/map/land/LandId';

import { getLandOwner } from '../../../selectors/landSelectors';
import { getPlayerLands, getTurnOwner } from '../../../selectors/playerSelectors';
import { getSpellById } from '../../../selectors/spellSelectors';
import { startMoving } from '../../../systems/armyActions';
import { armyFactory } from '../../../factories/armyFactory';
import { heroFactory } from '../../../factories/heroFactory';
import { regularsFactory } from '../../../factories/regularsFactory';
import { effectFactory } from '../../../factories/effectFactory';
import { relicts } from '../../../domain/treasure/treasureRepository';

import { HeroUnitType, RegularUnitType } from '../../../types/UnitType';
import { BuildingType } from '../../../types/Building';
import { SpellName } from '../../../types/Spell';
import { TreasureItem } from '../../../types/Treasures';

import { createGameStateStub } from '../../utils/createGameStateStub';
import { placeUnitsOnMap } from '../../utils/placeUnitsOnMap';

// Mock the useGameContext hook
const mockUseGameContext = jest.fn();
jest.mock('../../../contexts/GameContext', () => ({
  useGameContext: () => mockUseGameContext(),
}));

const renderWithProviders = (ui: React.ReactElement, gameState: GameState) => {
  mockUseGameContext.mockReturnValue({ gameState });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ApplicationContextProvider>{children}</ApplicationContextProvider>
  );
  return render(ui, { wrapper: Wrapper });
};

// Mock CSS modules
jest.mock('../../../ux-components/popups/css/LandCharacteristicsPopup.module.css', () => ({
  header: 'mocked-header',
  title: 'mocked-title',
  row: 'mocked-row',
  label: 'mocked-label',
  buildingsList: 'mocked-buildings-list',
  building: 'mocked-building',
  hero: 'mocked-hero',
}));

jest.mock('../../../ux-components/popups/css/Popup.module.css', () => ({
  popupContent: 'mocked-popup-content',
  header: 'mocked-header',
  title: 'mocked-title',
  characteristics: 'mocked-characteristics',
  row: 'mocked-row',
  label: 'mocked-label',
  value: 'mocked-value',
}));

describe('LandInfoPopup', () => {
  let gameStateStub: GameState;
  let mockTileState: LandState;
  const mockPosition = { x: 100, y: 100 };

  beforeEach(() => {
    // Create fresh game state with real battlefield for each test
    gameStateStub = createGameStateStub({ realBattlefield: true });

    // Find a tile controlled by player 1 (Morgana Shadowweaver) AND has buildings
    mockTileState = getPlayerLands(gameStateStub, gameStateStub.players[1].id).find((l) =>
      l.buildings.some((b) => b.id === BuildingType.STRONGHOLD)
    )!;

    jest.clearAllMocks();
  });

  it('displays building information when tile has buildings', () => {
    const landOwner = getLandOwner(gameStateStub, mockTileState.mapPos);
    const gameStateWithOwnerAsTurnOwner = {
      ...gameStateStub,
      turnOwner: landOwner,
    };

    renderWithProviders(
      <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
      gameStateWithOwnerAsTurnOwner
    );

    // Check if building information is displayed
    expect(screen.getByText('Buildings:')).toBeInTheDocument();
    expect(screen.getByText('Stronghold')).toBeInTheDocument();
  });

  it('displays controlled by information with player name', () => {
    renderWithProviders(
      <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
      gameStateStub
    );

    // Check if control information is displayed with player name
    expect(screen.getByText('Controlled By:')).toBeInTheDocument();
    expect(getLandOwner(gameStateStub, mockTileState.mapPos)).toBe(gameStateStub.players[1].id);
    expect(screen.getByText('Morgana Shadowweaver')).toBeInTheDocument();
  });

  it('displays both building and control information simultaneously', () => {
    const landOwner = getLandOwner(gameStateStub, mockTileState.mapPos);
    const gameStateWithOwnerAsTurnOwner = {
      ...gameStateStub,
      turnOwner: landOwner,
    };

    renderWithProviders(
      <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
      gameStateWithOwnerAsTurnOwner
    );

    // Verify both sections are present at the same time
    expect(screen.getByText('Buildings:')).toBeInTheDocument();
    expect(screen.getByText('Stronghold')).toBeInTheDocument();
    expect(screen.getByText('Controlled By:')).toBeInTheDocument();
    expect(screen.getByText('Morgana Shadowweaver')).toBeInTheDocument();
  });

  it('displays land type information', () => {
    renderWithProviders(
      <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
      gameStateStub
    );

    // Check land type information - should display the actual land type name
    expect(screen.getByText(mockTileState.land.id)).toBeInTheDocument();
    expect(screen.getByText(mockTileState.land.alignment)).toBeInTheDocument();
  });

  it('displays position and gold information', () => {
    renderWithProviders(
      <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
      gameStateStub
    );

    // Check position and gold information
    expect(screen.getByText('Position:')).toBeInTheDocument();
    expect(
      screen.getByText(mockTileState.mapPos.row + ', ' + mockTileState.mapPos.col)
    ).toBeInTheDocument();
    expect(screen.getByText('Gold per Turn:')).toBeInTheDocument();
    expect(screen.getByText(mockTileState.goldPerTurn.toString())).toBeInTheDocument();
  });

  describe('Army display functionality', () => {
    it('displays heroes when tile has heroes', () => {
      const landOwner = getLandOwner(gameStateStub, mockTileState.mapPos);
      const army1 = armyFactory(landOwner, mockTileState.mapPos, [
        heroFactory(HeroUnitType.FIGHTER, HeroUnitType.FIGHTER),
      ]);
      const army2 = armyFactory(landOwner, mockTileState.mapPos, [
        heroFactory(HeroUnitType.PYROMANCER, HeroUnitType.PYROMANCER),
      ]);
      const mockArmy: Armies = [army1, army2];

      // Add armies to centralized system and set turnOwner to landOwner so armies are visible
      const gameStateWithArmy = {
        ...gameStateStub,
        turnOwner: landOwner,
        armies: [...gameStateStub.armies, ...mockArmy],
      };

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateWithArmy
      );

      expect(screen.getByText('Heroes:')).toBeInTheDocument();
      expect(screen.getByText('Fighter lvl: 1')).toBeInTheDocument();
      expect(screen.getByText('Pyromancer lvl: 1')).toBeInTheDocument();
    });

    it('displays multiple heroes of same type with different names', () => {
      const landOwner = getLandOwner(gameStateStub, mockTileState.mapPos);
      const fighter1 = armyFactory(landOwner, mockTileState.mapPos, [
        heroFactory(HeroUnitType.FIGHTER, 'Cedric Brightshield'),
      ]);

      const fighter2 = armyFactory(landOwner, mockTileState.mapPos, [
        heroFactory(HeroUnitType.FIGHTER, 'Rowan Ashborne'),
      ]);

      const fighter3 = armyFactory(landOwner, mockTileState.mapPos, [
        heroFactory(HeroUnitType.FIGHTER, 'Gareth Dawnhart'),
      ]);

      const mockArmy: Armies = [fighter1, fighter2, fighter3];

      // Add armies to centralized system and set turnOwner to landOwner so armies are visible
      const gameStateWithArmy = {
        ...gameStateStub,
        turnOwner: landOwner,
        armies: [...gameStateStub.armies, ...mockArmy],
      };

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateWithArmy
      );

      expect(screen.getByText('Heroes:')).toBeInTheDocument();
      expect(screen.getByText('Cedric Brightshield lvl: 1')).toBeInTheDocument();
      expect(screen.getByText('Rowan Ashborne lvl: 1')).toBeInTheDocument();
      expect(screen.getByText('Gareth Dawnhart lvl: 1')).toBeInTheDocument();
    });

    it('displays units when tile has non-hero units', () => {
      const landOwner = getLandOwner(gameStateStub, mockTileState.mapPos);
      const army1 = armyFactory(landOwner, mockTileState.mapPos, undefined, [
        regularsFactory(RegularUnitType.WARRIOR),
      ]);
      const army2 = armyFactory(landOwner, mockTileState.mapPos, undefined, [
        regularsFactory(RegularUnitType.DWARF),
      ]);

      const mockArmy: Armies = [army1, army2];

      // Add armies to centralized system and set turnOwner to landOwner so armies are visible
      const gameStateWithArmy = {
        ...gameStateStub,
        turnOwner: landOwner,
        armies: [...gameStateStub.armies, ...mockArmy],
      };

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateWithArmy
      );

      expect(screen.getByText('Units:')).toBeInTheDocument();
      expect(screen.getByText('Warrior (20)')).toBeInTheDocument();
      expect(screen.getByText('Dwarf (20)')).toBeInTheDocument();
    });

    it('displays both heroes and units when tile has mixed army', () => {
      const regularWarriors = regularsFactory(RegularUnitType.WARRIOR);
      regularWarriors.count = 5;

      const landOwner = getLandOwner(gameStateStub, mockTileState.mapPos);
      const army1 = armyFactory(landOwner, mockTileState.mapPos, [
        heroFactory(HeroUnitType.FIGHTER, HeroUnitType.FIGHTER),
      ]);
      const army2 = armyFactory(landOwner, mockTileState.mapPos, undefined, [regularWarriors]);
      const army3 = armyFactory(landOwner, mockTileState.mapPos, undefined, [
        regularsFactory(RegularUnitType.DWARF),
      ]);
      startMoving(army3, { row: 1, col: 1 });
      const army4 = armyFactory(landOwner, mockTileState.mapPos, [
        heroFactory(HeroUnitType.CLERIC, HeroUnitType.CLERIC),
      ]);
      const army5 = armyFactory(landOwner, mockTileState.mapPos, undefined, [
        regularsFactory(RegularUnitType.ELF),
      ]);

      const mockArmy: Armies = [army1, army2, army3, army4, army5];

      // Add armies to centralized system and set turnOwner to landOwner so armies are visible
      const gameStateWithArmy = {
        ...gameStateStub,
        turnOwner: landOwner,
        armies: [...gameStateStub.armies, ...mockArmy],
      };

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateWithArmy
      );

      // Check heroes section
      expect(screen.getByText('Heroes:')).toBeInTheDocument();
      expect(screen.getByText('Fighter lvl: 1')).toBeInTheDocument();
      expect(screen.getByText('Cleric lvl: 1')).toBeInTheDocument();

      // Check units section
      expect(screen.getByText('Units:')).toBeInTheDocument();
      expect(screen.getByText('Warrior (5)')).toBeInTheDocument();
      expect(screen.getByText('Dwarf (20)')).toBeInTheDocument(); // moving army should also be displayed
      expect(screen.getByText('Elf (20)')).toBeInTheDocument();
    });

    it('does not display army sections when tile has no army', () => {
      // Filter out any armies that might be at this position
      const gameStateWithoutArmy = {
        ...gameStateStub,
        armies: gameStateStub.armies.filter((army) => {
          const armyPosition = army.movement.path[0];
          return !(
            armyPosition.row === mockTileState.mapPos.row &&
            armyPosition.col === mockTileState.mapPos.col
          );
        }),
      };

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateWithoutArmy
      );

      expect(screen.queryByText('Heroes:')).not.toBeInTheDocument();
      expect(screen.queryByText('Units:')).not.toBeInTheDocument();
    });

    it('displays only heroes section when tile has only heroes', () => {
      const landOwner = getLandOwner(gameStateStub, mockTileState.mapPos);
      const army1 = armyFactory(landOwner, mockTileState.mapPos, [
        heroFactory(HeroUnitType.RANGER, HeroUnitType.RANGER),
      ]);
      const army2 = armyFactory(landOwner, mockTileState.mapPos, [
        heroFactory(HeroUnitType.NECROMANCER, HeroUnitType.NECROMANCER),
      ]);

      const mockArmy: Armies = [army1, army2];

      // Add armies to centralized system and set turnOwner to landOwner so armies are visible
      const gameStateWithArmy = {
        ...gameStateStub,
        turnOwner: landOwner,
        armies: [...gameStateStub.armies, ...mockArmy],
      };

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateWithArmy
      );

      expect(screen.getByText('Heroes:')).toBeInTheDocument();
      expect(screen.getByText('Ranger lvl: 1')).toBeInTheDocument();
      expect(screen.getByText('Necromancer lvl: 1')).toBeInTheDocument();
      expect(screen.queryByText('Units:')).not.toBeInTheDocument();
    });

    it('displays only units section when tile has only non-hero units', () => {
      const landOwner = getLandOwner(gameStateStub, mockTileState.mapPos);
      const army1 = armyFactory(landOwner, mockTileState.mapPos, undefined, [
        regularsFactory(RegularUnitType.ORC),
      ]);
      const army2 = armyFactory(landOwner, mockTileState.mapPos, undefined, [
        regularsFactory(RegularUnitType.BALLISTA),
      ]);

      const mockArmy: Armies = [army1, army2];

      // Filter out any existing armies at this position and add only our test armies, set turnOwner
      const gameStateWithArmy = {
        ...gameStateStub,
        turnOwner: landOwner,
        armies: [
          ...gameStateStub.armies.filter((army) => {
            const armyPosition = army.movement.path[0];
            return !(
              armyPosition.row === mockTileState.mapPos.row &&
              armyPosition.col === mockTileState.mapPos.col
            );
          }),
          ...mockArmy,
        ],
      };

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateWithArmy
      );

      expect(screen.getByText('Units:')).toBeInTheDocument();
      expect(screen.getByText('Orc (20)')).toBeInTheDocument();
      expect(screen.getByText('Ballista (1)')).toBeInTheDocument();
      expect(screen.queryByText('Heroes:')).not.toBeInTheDocument();
    });
  });

  describe('Effects display functionality', () => {
    it('displays positive effects with green color when tile has positive effects', () => {
      // Create a positive effect (Blessing)
      // Add effect to the land and set the turnOwner to the land owner so effects are visible
      mockTileState.effects.push(
        effectFactory(getSpellById(SpellName.BLESSING), gameStateStub.turnOwner)
      );
      getTurnOwner(gameStateStub).landsOwned.add(getLandId(mockTileState.mapPos));

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateStub
      );

      // Check if effects section is displayed
      expect(screen.getByText('Effects:')).toBeInTheDocument();
      expect(
        screen.getByText(
          `${SpellName.BLESSING} (${getSpellById(SpellName.BLESSING).effect!.duration})`
        )
      ).toBeInTheDocument();

      // Check if the effect has green color for positive effect
      const effectElement = screen.getByText(
        `${SpellName.BLESSING} (${getSpellById(SpellName.BLESSING).effect!.duration})`
      );
      expect(effectElement).toHaveStyle({ color: '#4CAF50' });
    });

    it('displays negative effects with red color when tile has negative effects', () => {
      mockTileState.effects.push(
        effectFactory(getSpellById(SpellName.BLESSING), gameStateStub.turnOwner)
      );
      mockTileState.effects.push(
        effectFactory(getSpellById(SpellName.EMBER_RAID), gameStateStub.players[1].id)
      );
      getTurnOwner(gameStateStub).landsOwned.add(getLandId(mockTileState.mapPos));

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateStub
      );

      // Check if effects section is displayed
      expect(screen.getByText('Effects:')).toBeInTheDocument();
      expect(
        screen.getByText(
          `${SpellName.EMBER_RAID} (${getSpellById(SpellName.EMBER_RAID).effect!.duration})`
        )
      ).toBeInTheDocument();

      // Check if the effect has red color for negative effect
      const effectElement = screen.getByText(
        `${SpellName.EMBER_RAID} (${getSpellById(SpellName.EMBER_RAID).effect!.duration})`
      );
      expect(effectElement).toHaveStyle({ color: '#F44336' });
    });

    it('displays multiple effects with correct colors when tile has multiple effects', () => {
      // Create multiple effects with different types
      // Add effects to the land and set the turnOwner to the land owner so effects are visible
      mockTileState.effects.push(
        effectFactory(getSpellById(SpellName.BLESSING), gameStateStub.turnOwner)
      );
      mockTileState.effects.push(
        effectFactory(getSpellById(SpellName.EMBER_RAID), gameStateStub.players[1].id)
      );
      mockTileState.effects.push(
        effectFactory(getSpellById(SpellName.FERTILE_LAND), gameStateStub.turnOwner)
      );
      getTurnOwner(gameStateStub).landsOwned.add(getLandId(mockTileState.mapPos));

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateStub
      );

      // Check if effects section is displayed
      expect(screen.getByText('Effects:')).toBeInTheDocument();

      // Check all effects are displayed with correct durations
      expect(
        screen.getByText(
          `${SpellName.BLESSING} (${getSpellById(SpellName.BLESSING).effect!.duration})`
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          `${SpellName.EMBER_RAID} (${getSpellById(SpellName.EMBER_RAID).effect!.duration})`
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          `${SpellName.FERTILE_LAND} (${getSpellById(SpellName.FERTILE_LAND).effect!.duration})`
        )
      ).toBeInTheDocument();

      // Check colors
      const blessingElement = screen.getByText(
        `${SpellName.BLESSING} (${getSpellById(SpellName.BLESSING).effect!.duration})`
      );
      const emberRaidElement = screen.getByText(
        `${SpellName.EMBER_RAID} (${getSpellById(SpellName.EMBER_RAID).effect!.duration})`
      );
      const fertileLandElement = screen.getByText(
        `${SpellName.FERTILE_LAND} (${getSpellById(SpellName.FERTILE_LAND).effect!.duration})`
      );

      expect(blessingElement).toHaveStyle({ color: '#4CAF50' }); // Green for positive
      expect(emberRaidElement).toHaveStyle({ color: '#F44336' }); // Red for negative
      expect(fertileLandElement).toHaveStyle({ color: '#4CAF50' }); // Green for positive
    });

    it('does not display effects section when tile has no effects', () => {
      // Ensure no effects on the land but still set turnOwner to landOwner
      getTurnOwner(gameStateStub).landsOwned.add(getLandId(mockTileState.mapPos));

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateStub
      );

      expect(screen.queryByText('Effects:')).not.toBeInTheDocument();
    });

    it('displays effects with buildings and armies simultaneously', () => {
      // Create an effect, add armies and building
      mockTileState.effects.push(
        effectFactory(getSpellById(SpellName.BLESSING), gameStateStub.turnOwner)
      );
      mockTileState.effects.push(
        effectFactory(getSpellById(SpellName.VIEW_TERRITORY), gameStateStub.turnOwner)
      );
      placeUnitsOnMap(
        heroFactory(HeroUnitType.FIGHTER, HeroUnitType.FIGHTER),
        gameStateStub,
        mockTileState.mapPos
      );
      placeUnitsOnMap(
        regularsFactory(RegularUnitType.WARRIOR),
        gameStateStub,
        mockTileState.mapPos
      );

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateStub
      );

      // Verify all sections are present
      expect(screen.getByText('Buildings:')).toBeInTheDocument();
      expect(screen.getByText('Stronghold')).toBeInTheDocument();
      expect(screen.getByText('Effects:')).toBeInTheDocument();
      expect(
        screen.getByText(
          `${SpellName.BLESSING} (${getSpellById(SpellName.BLESSING).effect!.duration})`
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Heroes:')).toBeInTheDocument();
      expect(screen.getByText('Fighter lvl: 1')).toBeInTheDocument();
      expect(screen.getByText('Units:')).toBeInTheDocument();
      expect(screen.getByText('Warrior (20)')).toBeInTheDocument();
    });

    it('displays effects with different durations correctly', () => {
      // Create effects with custom durations by modifying them after creation
      const turnUndeadSpell = getSpellById(SpellName.TURN_UNDEAD);
      const viewTerritorySpell = getSpellById(SpellName.VIEW_TERRITORY);

      const effect1 = effectFactory(turnUndeadSpell, gameStateStub.players[0].id);
      const effect2 = effectFactory(viewTerritorySpell, gameStateStub.players[0].id);

      // Modify durations for testing
      effect1.duration = 1;
      effect2.duration = 5;

      // Add effects to the land and set the turnOwner to the land owner so effects are visible
      const landId = getLandId(mockTileState.mapPos);
      const landOwner = getLandOwner(gameStateStub, mockTileState.mapPos);
      const gameStateWithEffects = {
        ...gameStateStub,
        turnOwner: landOwner, // Set turnOwner to landOwner to make effects visible
        map: {
          ...gameStateStub.map,
          lands: {
            ...gameStateStub.map.lands,
            [landId]: {
              ...gameStateStub.map.lands[landId],
              effects: [effect1, effect2],
            },
          },
        },
      };

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateWithEffects
      );

      // Check if effects are displayed with correct durations
      expect(screen.getByText('Effects:')).toBeInTheDocument();
      expect(screen.getByText(`${SpellName.TURN_UNDEAD} (1)`)).toBeInTheDocument();
      expect(screen.getByText(`${SpellName.VIEW_TERRITORY} (5)`)).toBeInTheDocument();
    });
  });
  describe('Illusion display functionality', () => {
    it('displays illusion message when land owner has Mirror of Illusion treasure', () => {
      const randomSpy = jest.spyOn(Math, 'random');
      randomSpy.mockReturnValue(0);

      gameStateStub.players[1].empireTreasures.push(
        relicts.find((treasure) => treasure.id === TreasureItem.MIRROR_OF_ILLUSION)!
      );

      mockTileState.effects.push(
        effectFactory(getSpellById(SpellName.VIEW_TERRITORY), gameStateStub.turnOwner)
      );

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateStub
      );

      expect(screen.getByText('Gaze too long, and the mirror gazes back')).toBeInTheDocument();
      expect(screen.queryByText('Buildings:')).not.toBeInTheDocument();
      expect(screen.queryByText('Effects:')).not.toBeInTheDocument();

      randomSpy.mockRestore();
    });

    it('displays illusion message when land has ILLUSION spell effect', () => {
      const randomSpy = jest.spyOn(Math, 'random');
      randomSpy.mockReturnValue(0.1);

      mockTileState.effects.push(
        effectFactory(getSpellById(SpellName.ILLUSION), gameStateStub.players[1].id)
      );

      mockTileState.effects.push(
        effectFactory(getSpellById(SpellName.VIEW_TERRITORY), gameStateStub.turnOwner)
      );

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateStub
      );

      expect(screen.getByText('Look deeper, and the land begins reflects')).toBeInTheDocument();
      expect(screen.queryByText('Buildings:')).not.toBeInTheDocument();

      randomSpy.mockRestore();
    });
  });
});
