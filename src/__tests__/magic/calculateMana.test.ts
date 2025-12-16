import { GameState } from '../../state/GameState';
import { PlayerState } from '../../state/player/PlayerState';
import { PlayerProfile } from '../../state/player/PlayerProfile';
import { LandState } from '../../state/map/land/LandState';

import { getLand } from '../../selectors/landSelectors';
import { getPlayerLands } from '../../selectors/playerSelectors';
import { getArmiesByPlayer } from '../../selectors/armySelectors';
import { nextPlayer } from '../../systems/playerActions';

import { ManaType } from '../../types/Mana';
import { HeroUnitType } from '../../types/UnitType';
import { LandType } from '../../types/Land';
import { TreasureType } from '../../types/Treasures';
import { BuildingType } from '../../types/Building';

import { PREDEFINED_PLAYERS } from '../../domain/player/playerRepository';
import { getManaSource } from '../../domain/mana/manaSource';
import { getSpecialLandTypes } from '../../domain/land/landQueries';
import { getLandById } from '../../domain/land/landRepository';

import { createGameStateStub } from '../utils/createGameStateStub';
import { TestTurnManagement } from '../utils/TestTurnManagement';
import { relictFactory } from '../../factories/treasureFactory';

describe('Calculate Mana', () => {
  let testTurnManagement: TestTurnManagement;
  let gameStateStub: GameState;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    testTurnManagement = new TestTurnManagement();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  const expectedMana = (manaType: ManaType, mana: number, playerId: number = 0): void => {
    expect(gameStateStub.players[playerId].mana[manaType]).toBe(mana);
    Object.values(ManaType)
      .filter((m) => m !== manaType)
      .forEach((m) => {
        expect(gameStateStub.players[playerId].mana[m]).toBe(0);
      });
  };

  describe('only one initial mage', () => {
    it.each([
      [HeroUnitType.NECROMANCER, ManaType.BLACK, PREDEFINED_PLAYERS[1], 7],
      [HeroUnitType.CLERIC, ManaType.WHITE, PREDEFINED_PLAYERS[6], 6],
      [HeroUnitType.ENCHANTER, ManaType.BLUE, PREDEFINED_PLAYERS[7], 7],
      [HeroUnitType.DRUID, ManaType.GREEN, PREDEFINED_PLAYERS[12], 7],
      [HeroUnitType.PYROMANCER, ManaType.RED, PREDEFINED_PLAYERS[14], 6],
    ])(
      '%s produce only %s mana',
      (heroType: HeroUnitType, manaType: ManaType, player: PlayerProfile, inc: number) => {
        expect(player.type).toBe(heroType);

        const players = [player, PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[13]];
        gameStateStub = createGameStateStub({ gamePlayers: players });

        testTurnManagement.setGameState(gameStateStub);
        testTurnManagement.startNewTurn(gameStateStub);
        testTurnManagement.waitStartPhaseComplete();

        expect(gameStateStub.turn).toBe(2);
        gameStateStub.players.forEach((p) =>
          Object.values(p.mana).forEach((m) => expect(m).toBe(0))
        );

        testTurnManagement.makeNTurns(1);

        expectedMana(manaType, inc);

        testTurnManagement.makeNTurns(1);

        expectedMana(manaType, (gameStateStub.turn - 2) * inc);
      }
    );

    describe.each([
      [HeroUnitType.NECROMANCER, ManaType.BLACK, PREDEFINED_PLAYERS[1], 7],
      [HeroUnitType.CLERIC, ManaType.WHITE, PREDEFINED_PLAYERS[6], 6],
      [HeroUnitType.ENCHANTER, ManaType.BLUE, PREDEFINED_PLAYERS[7], 7],
      [HeroUnitType.DRUID, ManaType.GREEN, PREDEFINED_PLAYERS[12], 7],
      [HeroUnitType.PYROMANCER, ManaType.RED, PREDEFINED_PLAYERS[14], 6],
    ])(
      'special land has no effect if player (%s) not own them',
      (heroType: HeroUnitType, manaType: ManaType, player: PlayerProfile, inc: number) => {
        it.each(getSpecialLandTypes())('%s not add mana in mana pool', (landType: LandType) => {
          expect(player.type).toBe(heroType);

          const players = [player, PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[13]];
          gameStateStub = createGameStateStub({ gamePlayers: players });
          const homeLand = getPlayerLands(gameStateStub).find((l) =>
            l.buildings.some((b) => b.id === BuildingType.STRONGHOLD)
          )!;
          const specialLand = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 2 }; // outside player land
          getLand(gameStateStub, specialLand).land = getLandById(landType);

          testTurnManagement.setGameState(gameStateStub);
          testTurnManagement.startNewTurn(gameStateStub);
          testTurnManagement.waitStartPhaseComplete();

          expect(gameStateStub.turn).toBe(2);
          gameStateStub.players.forEach((p) =>
            Object.values(p.mana).forEach((m) => expect(m).toBe(0))
          );

          testTurnManagement.makeNTurns(1);

          expectedMana(manaType, inc);

          testTurnManagement.makeNTurns(1);

          expectedMana(manaType, (gameStateStub.turn - 2) * inc);
        });
      }
    );

    describe.each([
      [HeroUnitType.NECROMANCER, ManaType.BLACK, PREDEFINED_PLAYERS[1], 7],
      [HeroUnitType.CLERIC, ManaType.WHITE, PREDEFINED_PLAYERS[6], 6],
      [HeroUnitType.ENCHANTER, ManaType.BLUE, PREDEFINED_PLAYERS[7], 7],
      [HeroUnitType.DRUID, ManaType.GREEN, PREDEFINED_PLAYERS[12], 7],
      [HeroUnitType.PYROMANCER, ManaType.RED, PREDEFINED_PLAYERS[14], 6],
    ])(
      'special land has no effect if other player then current (%s) own it',
      (heroType: HeroUnitType, manaType: ManaType, player: PlayerProfile, inc: number) => {
        it.each(getSpecialLandTypes())('%s not add mana in mana pool', (landType: LandType) => {
          expect(player.type).toBe(heroType);

          const players = [player, PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[13]];
          gameStateStub = createGameStateStub({ gamePlayers: players });
          const homeLandPlayer2 = getPlayerLands(gameStateStub, PREDEFINED_PLAYERS[13].id).find(
            (l) => l.buildings.some((b) => b.id === BuildingType.STRONGHOLD)
          )!;
          const specialLand = {
            row: homeLandPlayer2.mapPos.row,
            col: homeLandPlayer2.mapPos.col + 1,
          }; // player 2 land
          getLand(gameStateStub, specialLand).land = getLandById(landType);

          while (gameStateStub.turn < 2) nextPlayer(gameStateStub);

          testTurnManagement.setGameState(gameStateStub);
          testTurnManagement.startNewTurn(gameStateStub);
          testTurnManagement.waitStartPhaseComplete();

          expect(gameStateStub.turn).toBe(2);
          gameStateStub.players.forEach((p) =>
            Object.values(p.mana).forEach((m) => expect(m).toBe(0))
          );

          testTurnManagement.makeNTurns(1);

          expectedMana(manaType, inc);

          testTurnManagement.makeNTurns(1);

          expectedMana(manaType, (gameStateStub.turn - 2) * inc);
        });
      }
    );

    describe.each([
      [HeroUnitType.NECROMANCER, ManaType.BLACK, PREDEFINED_PLAYERS[1], 7],
      [HeroUnitType.CLERIC, ManaType.WHITE, PREDEFINED_PLAYERS[6], 6],
      [HeroUnitType.ENCHANTER, ManaType.BLUE, PREDEFINED_PLAYERS[7], 7],
      [HeroUnitType.DRUID, ManaType.GREEN, PREDEFINED_PLAYERS[12], 7],
      [HeroUnitType.PYROMANCER, ManaType.RED, PREDEFINED_PLAYERS[14], 6],
    ])(
      'special land has effect if player (%s) own it and has hero of the related type',
      (heroType: HeroUnitType, manaType: ManaType, player: PlayerProfile, inc: number) => {
        it.each(getSpecialLandTypes())('verify effect of %s on mana pool', (landType: LandType) => {
          expect(player.type).toBe(heroType);

          const hasEffect = getManaSource({ landType: landType })?.heroTypes.includes(player.type)!;

          const players = [player, PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[13]];
          gameStateStub = createGameStateStub({ gamePlayers: players });

          const homeLand = getPlayerLands(gameStateStub).find((l) =>
            l.buildings.some((b) => b.id === BuildingType.STRONGHOLD)
          )!;

          const specialLand = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 }; // player land
          getLand(gameStateStub, specialLand).land = getLandById(landType);

          while (gameStateStub.turn < 2) nextPlayer(gameStateStub);

          testTurnManagement.setGameState(gameStateStub);
          testTurnManagement.startNewTurn(gameStateStub);
          testTurnManagement.waitStartPhaseComplete();

          expect(gameStateStub.turn).toBe(2);
          gameStateStub.players.forEach((p) =>
            Object.values(p.mana).forEach((m) => expect(m).toBe(0))
          );

          testTurnManagement.makeNTurns(1);

          expectedMana(manaType, inc + (hasEffect ? 1 : 0));

          testTurnManagement.makeNTurns(1);

          expectedMana(manaType, (gameStateStub.turn - 2) * (inc + (hasEffect ? 1 : 0)));
        });
      }
    );
  });

  const expectManaOnTurn = (turn: number, base: number[]): void => {
    // verifying mana for all players when player[0] is turnOwner and that is why their mana on the previous turn
    expectedMana(ManaType.BLACK, base[0] * (turn - 2), 0);
    expectedMana(ManaType.WHITE, base[1] * (turn - 3), 1);
    expectedMana(ManaType.BLUE, base[2] * (turn - 3), 2);
    expectedMana(ManaType.GREEN, base[3] * (turn - 3), 3);
    expectedMana(ManaType.RED, base[4] * (turn - 3), 4);
  };

  const baseMana = (player: PlayerState) => {
    const realmLands: LandState[] = [];
    player.landsOwned.forEach((l) => realmLands.push(gameStateStub.map.lands[l]));

    const playerSpecialLands = realmLands.filter(
      (l) =>
        (player.playerProfile.type === HeroUnitType.NECROMANCER &&
          (l.land.id === LandType.BLIGHTED_FEN || l.land.id === LandType.SHADOW_MIRE)) ||
        (player.playerProfile.type === HeroUnitType.CLERIC &&
          (l.land.id === LandType.SUN_SPIRE_PEAKS || l.land.id === LandType.GOLDEN_PLAINS)) ||
        (player.playerProfile.type === HeroUnitType.ENCHANTER &&
          (l.land.id === LandType.CRISTAL_BASIN || l.land.id === LandType.MISTY_GLADES)) ||
        (player.playerProfile.type === HeroUnitType.DRUID &&
          (l.land.id === LandType.HEARTWOOD_COVE || l.land.id === LandType.VERDANT_GLADE)) ||
        (player.playerProfile.type === HeroUnitType.PYROMANCER &&
          (l.land.id === LandType.VOLCANO || l.land.id === LandType.LAVA))
    ).length;
    const playerHero = getArmiesByPlayer(gameStateStub, player.id)[0].heroes[0];
    return (playerHero.mana || 0) + playerSpecialLands;
  };

  it('on real map with 5 mage players and verify no mana calculation deviations', () => {
    const players = [
      PREDEFINED_PLAYERS[1],
      PREDEFINED_PLAYERS[6],
      PREDEFINED_PLAYERS[7],
      PREDEFINED_PLAYERS[12],
      PREDEFINED_PLAYERS[14],
    ];
    gameStateStub = createGameStateStub({
      gamePlayers: players,
      realBattlefield: true,
      battlefieldSize: { rows: 5, cols: 30 },
    });
    // calculate baseMana per turn for each player
    const basePlayersMana = gameStateStub.players.map((p) => baseMana(p));

    testTurnManagement.setGameState(gameStateStub);
    testTurnManagement.startNewTurn(gameStateStub);
    testTurnManagement.waitStartPhaseComplete();

    testTurnManagement.makeNTurns(10);

    expectManaOnTurn(gameStateStub.turn, basePlayersMana);

    for (let i = 0; i < 10; i++) {
      testTurnManagement.makeNTurns(1);
      expectManaOnTurn(gameStateStub.turn, basePlayersMana);
    }
  });

  it('mana increased by 1 per each specific land even if no such hero type when player have TreasureItem.HEARTSTONE_OF_ORRIVANE', () => {
    const players = [PREDEFINED_PLAYERS[1], PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[2]];
    gameStateStub = createGameStateStub({ gamePlayers: players });
    gameStateStub.players[0].empireTreasures.push(
      relictFactory(TreasureType.HEARTSTONE_OF_ORRIVANE)
    );

    const homeLand = getPlayerLands(gameStateStub).find((l) =>
      l.buildings.some((b) => b.id === BuildingType.STRONGHOLD)
    )!;

    getLand(gameStateStub, homeLand.mapPos).land = getLandById(LandType.VOLCANO); // this should add red mana to player 0

    testTurnManagement.setGameState(gameStateStub);
    testTurnManagement.startNewTurn(gameStateStub);
    testTurnManagement.waitStartPhaseComplete();

    expect(gameStateStub.turn).toBe(2);
    gameStateStub.players.forEach((p) => Object.values(p.mana).forEach((m) => expect(m).toBe(0)));

    testTurnManagement.makeNTurns(1);

    expect(gameStateStub.players[0].mana[ManaType.RED]).toBe(1);
    expect(gameStateStub.players[0].mana[ManaType.BLACK]).toBe(7);
    expect(gameStateStub.players[0].mana[ManaType.WHITE]).toBe(0);
    expect(gameStateStub.players[0].mana[ManaType.BLUE]).toBe(0);
    expect(gameStateStub.players[0].mana[ManaType.GREEN]).toBe(0);
  });
});
