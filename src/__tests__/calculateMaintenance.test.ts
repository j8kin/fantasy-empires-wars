import { calculateMaintenance } from '../map/gold/calculateMaintenance';
import { battlefieldLandId, GameState } from '../types/GameState';
import { generateMockMap } from './utils/generateMockMap';
import { PREDEFINED_PLAYERS } from '../types/GamePlayer';
import { getUnit, UnitType } from '../types/Army';

describe('Calculate Maintenance', () => {
  const player = PREDEFINED_PLAYERS[0];

  const mockGameState: GameState = {
    battlefieldLands: generateMockMap(10, 10),
    mapSize: 'huge',
    selectedPlayer: player,
    opponents: PREDEFINED_PLAYERS.slice(1, 3),
    turn: 0,
  };
  beforeEach(() => {
    mockGameState.battlefieldLands = generateMockMap(10, 10);
  });

  it('No Army', () => {
    const maintenance = calculateMaintenance(mockGameState, player);
    expect(maintenance).toBe(0);
  });

  it.each([
    [UnitType.FIGHTER, 1, 100],
    [UnitType.FIGHTER, 3, 100],
    [UnitType.FIGHTER, 4, 200],
    [UnitType.FIGHTER, 20, 600],
    [UnitType.HAMMERLORD, 1, 100],
    [UnitType.RANGER, 1, 100],
    [UnitType.PYROMANCER, 1, 100],
    [UnitType.CLERIC, 1, 100],
    [UnitType.DRUID, 1, 100],
    [UnitType.ENCHANTER, 1, 100],
    [UnitType.NECROMANCER, 1, 100],
  ])('Hero %s maintenance level %s', (hero, level, expected) => {
    mockGameState.battlefieldLands[battlefieldLandId({ row: 0, col: 0 })].controlledBy = player.id;
    const heroUnit = getUnit(hero);
    heroUnit.level = level;

    mockGameState.battlefieldLands[battlefieldLandId({ row: 0, col: 0 })].army = [
      { unit: heroUnit, quantity: 1 },
    ];
    const maintenance = calculateMaintenance(mockGameState, player);
    expect(maintenance).toBe(expected);
  });

  it.each([
    [UnitType.WARRIOR, 1, 1, 4],
    [UnitType.WARRIOR, 2, 1, 6],
    [UnitType.WARRIOR, 3, 1, 8],
    [UnitType.WARRIOR, 1, 20, 80],
    [UnitType.WARRIOR, 1, 753, 3012],
    [UnitType.WARRIOR, 2, 20, 120],
    [UnitType.WARRIOR, 3, 20, 160],
    [UnitType.DWARF, 1, 1, 5],
    [UnitType.ORC, 1, 1, 5],
    [UnitType.ORC, 1, 20, 90], // orc maintenance is not an integer number
    [UnitType.ELF, 1, 1, 5],
    [UnitType.DARKELF, 1, 1, 5],
    [UnitType.BALISTA, 1, 1, 150],
    [UnitType.CATAPULT, 1, 1, 50],
  ])('Unit %s maintenance level %s quantity %s', (hero, level, quantity, expected) => {
    mockGameState.battlefieldLands[battlefieldLandId({ row: 0, col: 0 })].controlledBy = player.id;
    const heroUnit = getUnit(hero);
    heroUnit.level = level;

    mockGameState.battlefieldLands[battlefieldLandId({ row: 0, col: 0 })].army = [
      { unit: heroUnit, quantity: quantity },
    ];
    const maintenance = calculateMaintenance(mockGameState, player);
    expect(maintenance).toBe(expected);
  });

  it('Multiple units in one army', () => {
    const elitDwarf = getUnit(UnitType.DWARF);
    elitDwarf.level = 3;

    mockGameState.battlefieldLands[battlefieldLandId({ row: 0, col: 0 })].controlledBy = player.id;
    mockGameState.battlefieldLands[battlefieldLandId({ row: 0, col: 0 })].army = [
      { unit: getUnit(UnitType.NECROMANCER), quantity: 1 },
      { unit: getUnit(UnitType.DWARF), quantity: 20 },
      { unit: getUnit(UnitType.BALISTA), quantity: 1 },
      { unit: elitDwarf, quantity: 17 },
    ];
    const maintenance = calculateMaintenance(mockGameState, player);
    expect(maintenance).toBe(520);
  });
});
