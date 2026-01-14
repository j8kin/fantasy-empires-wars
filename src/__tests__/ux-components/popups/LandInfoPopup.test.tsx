import React from 'react';
import { render, screen } from '@testing-library/react';
import LandInfoPopup from '../../../ux-components/popups/LandInfoPopup';

import { ApplicationContextProvider } from '../../../contexts/ApplicationContext';
import { getLandId } from '../../../state/map/land/LandId';
import { getLand, getLandOwner, getPlayerLands, hasBuilding } from '../../../selectors/landSelectors';
import { getTurnOwner } from '../../../selectors/playerSelectors';
import { getSpellById } from '../../../selectors/spellSelectors';
import { startMoving } from '../../../systems/armyActions';
import { armyFactory } from '../../../factories/armyFactory';
import { heroFactory } from '../../../factories/heroFactory';
import { regularsFactory } from '../../../factories/regularsFactory';
import { effectFactory } from '../../../factories/effectFactory';
import { relictFactory } from '../../../factories/treasureFactory';
import { updateLandEffect } from '../../../systems/gameStateActions';
import { construct } from '../../../map/building/construct';
import { NO_PLAYER } from '../../../domain/player/playerRepository';
import { HeroUnitName, RegularUnitName, WarMachineName } from '../../../types/UnitType';
import { BuildingName } from '../../../types/Building';
import { SpellName } from '../../../types/Spell';
import { TreasureName } from '../../../types/Treasures';
import type { GameState } from '../../../state/GameState';
import type { LandState } from '../../../state/map/land/LandState';
import type { ArmyState } from '../../../state/army/ArmyState';

import { createGameStateStub } from '../../utils/createGameStateStub';
import { placeUnitsOnMap } from '../../utils/placeUnitsOnMap';
import { warMachineFactory } from '../../../factories/warMachineFactory';

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
      hasBuilding(l, BuildingName.STRONGHOLD)
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
    renderWithProviders(<LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />, gameStateStub);

    // Check if control information is displayed with player name
    expect(screen.getByText('Controlled By:')).toBeInTheDocument();
    expect(getLandOwner(gameStateStub, mockTileState.mapPos)).toBe(gameStateStub.players[1].id);
    expect(screen.getByTestId('owner')).toHaveTextContent(gameStateStub.players[1].playerProfile.name);
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
    expect(screen.getByTestId('owner')).toHaveTextContent(gameStateStub.players[1].playerProfile.name);
  });

  it('displays land type information', () => {
    renderWithProviders(<LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />, gameStateStub);

    // Check land type information - should display the actual land type name
    expect(screen.getByText(mockTileState.land.id)).toBeInTheDocument();
    expect(screen.getByText(mockTileState.land.alignment)).toBeInTheDocument();
  });

  it('displays position and gold information', () => {
    renderWithProviders(<LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />, gameStateStub);

    // Check position and gold information
    expect(screen.getByText('Position:')).toBeInTheDocument();
    expect(screen.getByText(mockTileState.mapPos.row + ', ' + mockTileState.mapPos.col)).toBeInTheDocument();
    expect(screen.getByText('Gold per Turn:')).toBeInTheDocument();
    expect(screen.getByText(mockTileState.goldPerTurn.toString())).toBeInTheDocument();
  });

  describe('Neutral lands display functionality', () => {
    it('display neutral land information', () => {
      const landPos = { row: 0, col: 0 };
      const land = getLand(gameStateStub, landPos);
      expect(getLandOwner(gameStateStub, landPos)).toBe(NO_PLAYER.id);

      renderWithProviders(<LandInfoPopup landPos={landPos} screenPosition={mockPosition} />, gameStateStub);

      expect(screen.getByText(land.land.id)).toBeInTheDocument();
      expect(screen.getByText(land.land.alignment)).toBeInTheDocument();
      expect(screen.getByText('Position:')).toBeInTheDocument();
      expect(screen.getByText(land.mapPos.row + ', ' + land.mapPos.col)).toBeInTheDocument();
      expect(screen.getByText('Gold per Turn:')).toBeInTheDocument();
      expect(screen.getByText(land.goldPerTurn.toString())).toBeInTheDocument();
      expect(screen.getByText('Controlled By:')).toBeInTheDocument();
      expect(screen.getByTestId('owner')).toHaveTextContent('none');
      expect(screen.queryByText('Buildings:')).not.toBeInTheDocument();
      expect(screen.queryByText('Effects:')).not.toBeInTheDocument();
      expect(screen.queryByText('Heroes:')).not.toBeInTheDocument();
      expect(screen.queryByText('Units:')).not.toBeInTheDocument();
      expect(screen.queryByText('War Machines:')).not.toBeInTheDocument();
    });

    it('displays buildings on neutral lands', () => {
      const landPos = { row: 0, col: 0 };
      construct(gameStateStub, BuildingName.BARRACKS, landPos);
      const land = getLand(gameStateStub, landPos);
      expect(getLandOwner(gameStateStub, landPos)).toBe(NO_PLAYER.id);

      renderWithProviders(<LandInfoPopup landPos={landPos} screenPosition={mockPosition} />, gameStateStub);

      expect(screen.getByText(land.land.id)).toBeInTheDocument();
      expect(screen.getByText(land.land.alignment)).toBeInTheDocument();
      expect(screen.getByText('Position:')).toBeInTheDocument();
      expect(screen.getByText(land.mapPos.row + ', ' + land.mapPos.col)).toBeInTheDocument();
      expect(screen.getByText('Gold per Turn:')).toBeInTheDocument();
      expect(screen.getByText(land.goldPerTurn.toString())).toBeInTheDocument();
      expect(screen.getByText('Controlled By:')).toBeInTheDocument();
      /*************** Neutral land *************************/
      expect(screen.getByTestId('owner')).toHaveTextContent('none');
      /*************** Barack is visible ********************/
      expect(screen.getByText('Buildings:')).toBeInTheDocument();
      expect(screen.getByText('Barracks')).toBeInTheDocument();
      /******************************************************/
      expect(screen.queryByText('Effects:')).not.toBeInTheDocument();
      expect(screen.queryByText('Heroes:')).not.toBeInTheDocument();
      expect(screen.queryByText('Units:')).not.toBeInTheDocument();
      expect(screen.queryByText('War Machines:')).not.toBeInTheDocument();
    });
  });
  describe('Army display functionality', () => {
    it('displays heroes when tile has heroes', () => {
      const landOwner = getLandOwner(gameStateStub, mockTileState.mapPos);
      const army1 = armyFactory(landOwner, mockTileState.mapPos, {
        hero: heroFactory(HeroUnitName.FIGHTER, HeroUnitName.FIGHTER),
      });
      const army2 = armyFactory(landOwner, mockTileState.mapPos, {
        hero: heroFactory(HeroUnitName.PYROMANCER, HeroUnitName.PYROMANCER),
      });
      const mockArmy: ArmyState[] = [army1, army2];

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
      const fighter1 = armyFactory(landOwner, mockTileState.mapPos, {
        hero: heroFactory(HeroUnitName.FIGHTER, 'Cedric Brightshield'),
      });

      const fighter2 = armyFactory(landOwner, mockTileState.mapPos, {
        hero: heroFactory(HeroUnitName.FIGHTER, 'Rowan Ashborne'),
      });

      const fighter3 = armyFactory(landOwner, mockTileState.mapPos, {
        hero: heroFactory(HeroUnitName.FIGHTER, 'Gareth Dawnhart'),
      });

      const mockArmy: ArmyState[] = [fighter1, fighter2, fighter3];

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
      const army1 = armyFactory(landOwner, mockTileState.mapPos, {
        regular: regularsFactory(RegularUnitName.WARRIOR),
      });
      const army2 = armyFactory(landOwner, mockTileState.mapPos, {
        regular: regularsFactory(RegularUnitName.DWARF),
      });

      const mockArmy: ArmyState[] = [army1, army2];

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
      const regularWarriors = regularsFactory(RegularUnitName.WARRIOR);
      regularWarriors.count = 5;

      const landOwner = getLandOwner(gameStateStub, mockTileState.mapPos);
      const army1 = armyFactory(landOwner, mockTileState.mapPos, {
        hero: heroFactory(HeroUnitName.FIGHTER, HeroUnitName.FIGHTER),
      });
      const army2 = armyFactory(landOwner, mockTileState.mapPos, {
        regular: regularWarriors,
      });
      const army3 = armyFactory(landOwner, mockTileState.mapPos, {
        regular: regularsFactory(RegularUnitName.DWARF),
      });
      startMoving(army3, { row: 1, col: 1 });
      const army4 = armyFactory(landOwner, mockTileState.mapPos, {
        hero: heroFactory(HeroUnitName.CLERIC, HeroUnitName.CLERIC),
      });
      const army5 = armyFactory(landOwner, mockTileState.mapPos, {
        regular: regularsFactory(RegularUnitName.ELF),
      });

      const mockArmy: ArmyState[] = [army1, army2, army3, army4, army5];

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
          return !(armyPosition.row === mockTileState.mapPos.row && armyPosition.col === mockTileState.mapPos.col);
        }),
      };

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateWithoutArmy
      );

      expect(screen.queryByText('Heroes:')).not.toBeInTheDocument();
      expect(screen.queryByText('Units:')).not.toBeInTheDocument();
      expect(screen.queryByText('War Machines:')).not.toBeInTheDocument();
    });

    it('displays only heroes section when tile has only heroes', () => {
      const landOwner = getLandOwner(gameStateStub, mockTileState.mapPos);
      const army1 = armyFactory(landOwner, mockTileState.mapPos, {
        hero: heroFactory(HeroUnitName.RANGER, HeroUnitName.RANGER),
      });
      const army2 = armyFactory(landOwner, mockTileState.mapPos, {
        hero: heroFactory(HeroUnitName.NECROMANCER, HeroUnitName.NECROMANCER),
      });

      const mockArmy: ArmyState[] = [army1, army2];

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
      expect(screen.queryByText('War Machines:')).not.toBeInTheDocument();
    });

    it('War-machines info display ignoring durability', () => {
      const landPos = getPlayerLands(gameStateStub, gameStateStub.players[1].id)[1].mapPos;
      Object.assign(
        gameStateStub,
        updateLandEffect(
          gameStateStub,
          landPos,
          effectFactory(SpellName.VIEW_TERRITORY, gameStateStub.turnOwner) // opponent land visible only with this effect
        )
      );
      const catapult1 = warMachineFactory(WarMachineName.CATAPULT);
      catapult1.durability = 1;
      catapult1.count = 3;
      placeUnitsOnMap(catapult1, gameStateStub, landPos);

      const catapult2 = warMachineFactory(WarMachineName.CATAPULT);
      catapult2.durability = 7;
      catapult2.count = 1;
      placeUnitsOnMap(catapult2, gameStateStub, landPos);

      renderWithProviders(<LandInfoPopup landPos={landPos} screenPosition={mockPosition} />, gameStateStub);

      expect(screen.queryByText('Heroes:')).not.toBeInTheDocument();
      expect(screen.queryByText('Units:')).not.toBeInTheDocument();
      expect(screen.getByText('War Machines:')).toBeInTheDocument();
      expect(screen.getByText('Catapult (4)')).toBeInTheDocument();
    });

    it('displays only units section when tile has only non-hero units', () => {
      const landPos = getPlayerLands(gameStateStub, gameStateStub.players[1].id)[1].mapPos;
      Object.assign(
        gameStateStub,
        updateLandEffect(
          gameStateStub,
          landPos,
          effectFactory(SpellName.VIEW_TERRITORY, gameStateStub.turnOwner) // opponent land visible only with this effect
        )
      );

      placeUnitsOnMap(regularsFactory(RegularUnitName.ORC), gameStateStub, landPos);
      placeUnitsOnMap(warMachineFactory(WarMachineName.BALLISTA), gameStateStub, landPos);

      renderWithProviders(<LandInfoPopup landPos={landPos} screenPosition={mockPosition} />, gameStateStub);

      expect(screen.getByText('Units:')).toBeInTheDocument();
      expect(screen.getByText('Orc (20)')).toBeInTheDocument();
      expect(screen.getByText('War Machines:')).toBeInTheDocument();
      expect(screen.getByText('Ballista (1)')).toBeInTheDocument();
      expect(screen.queryByText('Heroes:')).not.toBeInTheDocument();
    });
  });

  describe('Effects display functionality', () => {
    it('displays positive effects with green color when tile has positive effects', () => {
      // Create a positive effect (Blessing)
      // Add effect to the land and set the turnOwner to the land owner so effects are visible
      mockTileState.effects.push(effectFactory(SpellName.BLESSING, gameStateStub.turnOwner));
      getTurnOwner(gameStateStub).landsOwned.add(getLandId(mockTileState.mapPos));

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateStub
      );

      // Check if effects section is displayed
      expect(screen.getByText('Effects:')).toBeInTheDocument();
      expect(
        screen.getByText(`${SpellName.BLESSING} (${getSpellById(SpellName.BLESSING).rules!.duration})`)
      ).toBeInTheDocument();

      // Check if the effect has green color for positive effect
      const effectElement = screen.getByText(
        `${SpellName.BLESSING} (${getSpellById(SpellName.BLESSING).rules!.duration})`
      );
      expect(effectElement).toHaveStyle({ color: '#4CAF50' });
    });

    it('displays negative effects with red color when tile has negative effects', () => {
      mockTileState.effects.push(effectFactory(SpellName.BLESSING, gameStateStub.turnOwner));
      mockTileState.effects.push(effectFactory(SpellName.EMBER_RAID, gameStateStub.players[1].id));
      getTurnOwner(gameStateStub).landsOwned.add(getLandId(mockTileState.mapPos));

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateStub
      );

      // Check if effects section is displayed
      expect(screen.getByText('Effects:')).toBeInTheDocument();
      expect(
        screen.getByText(`${SpellName.EMBER_RAID} (${getSpellById(SpellName.EMBER_RAID).rules!.duration})`)
      ).toBeInTheDocument();

      // Check if the effect has red color for negative effect
      const effectElement = screen.getByText(
        `${SpellName.EMBER_RAID} (${getSpellById(SpellName.EMBER_RAID).rules!.duration})`
      );
      expect(effectElement).toHaveStyle({ color: '#F44336' });
    });

    it('displays permanent effects with blue color when tile has permanent effects', () => {
      const land = getPlayerLands(gameStateStub)[0];
      const effect = effectFactory(TreasureName.AEGIS_SHARD, gameStateStub.turnOwner);
      Object.assign(gameStateStub, updateLandEffect(gameStateStub, land.mapPos, effect));

      renderWithProviders(<LandInfoPopup landPos={land.mapPos} screenPosition={mockPosition} />, gameStateStub);

      // Check if effects section is displayed
      expect(screen.getByText('Effects:')).toBeInTheDocument();
      expect(screen.getByText(`${TreasureName.AEGIS_SHARD} (${effect.rules!.duration})`)).toBeInTheDocument();

      // Check if the effect has red color for negative effect
      const effectElement = screen.getByText(`${TreasureName.AEGIS_SHARD} (${effect.rules!.duration})`);
      expect(effectElement).toHaveStyle({ color: '#344CEB' });
    });

    it('displays multiple effects with correct colors when tile has multiple effects', () => {
      // Create multiple effects with different types
      // Add effects to the land and set the turnOwner to the land owner so effects are visible
      mockTileState.effects.push(effectFactory(SpellName.BLESSING, gameStateStub.turnOwner));
      mockTileState.effects.push(effectFactory(SpellName.EMBER_RAID, gameStateStub.players[1].id));
      mockTileState.effects.push(effectFactory(SpellName.FERTILE_LAND, gameStateStub.turnOwner));
      getTurnOwner(gameStateStub).landsOwned.add(getLandId(mockTileState.mapPos));

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateStub
      );

      // Check if effects section is displayed
      expect(screen.getByText('Effects:')).toBeInTheDocument();

      // Check all effects are displayed with correct durations
      expect(
        screen.getByText(`${SpellName.BLESSING} (${getSpellById(SpellName.BLESSING).rules!.duration})`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(`${SpellName.EMBER_RAID} (${getSpellById(SpellName.EMBER_RAID).rules!.duration})`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(`${SpellName.FERTILE_LAND} (${getSpellById(SpellName.FERTILE_LAND).rules!.duration})`)
      ).toBeInTheDocument();

      // Check colors
      const blessingElement = screen.getByText(
        `${SpellName.BLESSING} (${getSpellById(SpellName.BLESSING).rules!.duration})`
      );
      const emberRaidElement = screen.getByText(
        `${SpellName.EMBER_RAID} (${getSpellById(SpellName.EMBER_RAID).rules!.duration})`
      );
      const fertileLandElement = screen.getByText(
        `${SpellName.FERTILE_LAND} (${getSpellById(SpellName.FERTILE_LAND).rules!.duration})`
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
      mockTileState.effects.push(effectFactory(SpellName.BLESSING, gameStateStub.turnOwner));
      mockTileState.effects.push(effectFactory(SpellName.VIEW_TERRITORY, gameStateStub.turnOwner));
      placeUnitsOnMap(heroFactory(HeroUnitName.FIGHTER, HeroUnitName.FIGHTER), gameStateStub, mockTileState.mapPos);
      placeUnitsOnMap(regularsFactory(RegularUnitName.WARRIOR), gameStateStub, mockTileState.mapPos);

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateStub
      );

      // Verify all sections are present
      expect(screen.getByText('Buildings:')).toBeInTheDocument();
      expect(screen.getByText('Stronghold')).toBeInTheDocument();
      expect(screen.getByText('Effects:')).toBeInTheDocument();
      expect(
        screen.getByText(`${SpellName.BLESSING} (${getSpellById(SpellName.BLESSING).rules!.duration})`)
      ).toBeInTheDocument();
      expect(screen.getByText('Heroes:')).toBeInTheDocument();
      expect(screen.getByText('Fighter lvl: 1')).toBeInTheDocument();
      expect(screen.getByText('Units:')).toBeInTheDocument();
      expect(screen.getByText('Warrior (20)')).toBeInTheDocument();
    });

    it('displays effects with different durations correctly', () => {
      // Create effects with custom durations by modifying them after creation
      const effect1 = effectFactory(SpellName.TURN_UNDEAD, gameStateStub.players[0].id);
      const effect2 = effectFactory(SpellName.VIEW_TERRITORY, gameStateStub.players[0].id);

      // Modify durations for testing
      effect1.rules.duration = 1;
      effect2.rules.duration = 5;

      // Add effects to the land and set the turnOwner to the land owner so effects are visible
      Object.assign(gameStateStub, updateLandEffect(gameStateStub, mockTileState.mapPos, effect1));
      Object.assign(gameStateStub, updateLandEffect(gameStateStub, mockTileState.mapPos, effect2));

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateStub
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

      gameStateStub.players[1].empireTreasures.push(relictFactory(TreasureName.MIRROR_OF_ILLUSION));

      mockTileState.effects.push(effectFactory(SpellName.VIEW_TERRITORY, gameStateStub.turnOwner));

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

      mockTileState.effects.push(effectFactory(SpellName.ILLUSION, gameStateStub.players[1].id));

      mockTileState.effects.push(effectFactory(SpellName.VIEW_TERRITORY, gameStateStub.turnOwner));

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateStub
      );

      expect(screen.getByText('Look deeper, and the land begins reflects')).toBeInTheDocument();
      expect(screen.queryByText('Buildings:')).not.toBeInTheDocument();

      randomSpy.mockRestore();
    });
  });

  describe('Display corrupted land information', () => {
    it('displays corrupted land information when tile is corrupted', () => {
      mockTileState.corrupted = true;

      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateStub
      );

      expect(screen.getByText('Corrupted ' + mockTileState.land.id)).toBeInTheDocument();
      expect(screen.getByText('Position:')).toBeInTheDocument();
      expect(screen.getByText(mockTileState.mapPos.row + ', ' + mockTileState.mapPos.col)).toBeInTheDocument();
      expect(screen.getByText('Gold per Turn:')).toBeInTheDocument();
      expect(screen.getByText(mockTileState.goldPerTurn.toString())).toBeInTheDocument();
    });
  });

  describe('VIEW_TERRITORY and COMPASS_OF_DOMINION effects', () => {
    it('opponent territory is not visible without VIEW_TERRITORY effect', () => {
      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateStub
      );
      expect(screen.queryByText('Buildings:')).not.toBeInTheDocument();
      expect(screen.queryByText('Heroes:')).not.toBeInTheDocument();

      // add VIEW_TERRITORY effect to the land
      const effect = effectFactory(SpellName.VIEW_TERRITORY, gameStateStub.turnOwner);
      Object.assign(gameStateStub, updateLandEffect(gameStateStub, mockTileState.mapPos, effect));
      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateStub
      );
      expect(screen.getByText('Buildings:')).toBeInTheDocument();
      expect(screen.getByText('Heroes:')).toBeInTheDocument();
    });

    it('opponent territory is not visible without COMPASS_OF_DOMINION effect', () => {
      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateStub
      );
      expect(screen.queryByText('Buildings:')).not.toBeInTheDocument();
      expect(screen.queryByText('Heroes:')).not.toBeInTheDocument();

      // add COMPASS_OF_DOMINION effect to the land
      const effect = effectFactory(TreasureName.COMPASS_OF_DOMINION, gameStateStub.turnOwner);
      Object.assign(gameStateStub, updateLandEffect(gameStateStub, mockTileState.mapPos, effect));
      renderWithProviders(
        <LandInfoPopup landPos={mockTileState.mapPos} screenPosition={mockPosition} />,
        gameStateStub
      );
      expect(screen.getByText('Buildings:')).toBeInTheDocument();
      expect(screen.getByText('Heroes:')).toBeInTheDocument();
    });
  });
});
