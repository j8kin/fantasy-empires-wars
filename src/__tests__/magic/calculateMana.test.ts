import { getLand, getPlayerLands, hasBuilding } from '../../selectors/landSelectors';
import { getArmiesByPlayer } from '../../selectors/armySelectors';
import { nextPlayer } from '../../systems/playerActions';
import { relictFactory } from '../../factories/treasureFactory';
import { getManaSource } from '../../domain/mana/manaSource';
import { getSpecialLandKinds } from '../../domain/land/landQueries';
import { getLandById } from '../../domain/land/landRepository';
import { PREDEFINED_PLAYERS } from '../../domain/player/playerRepository';
import { Mana, MAX_MANA } from '../../types/Mana';
import { HeroUnitName } from '../../types/UnitType';
import { LandName } from '../../types/Land';
import { TreasureName } from '../../types/Treasures';
import { BuildingName } from '../../types/Building';
import type { GameState } from '../../state/GameState';
import type { PlayerState } from '../../state/player/PlayerState';
import type { PlayerProfile } from '../../state/player/PlayerProfile';
import type { LandState } from '../../state/map/land/LandState';
import type { LandType } from '../../types/Land';
import type { ManaType } from '../../types/Mana';
import type { HeroUnitType } from '../../types/UnitType';

import { createGameStateStub } from '../utils/createGameStateStub';
import { TestTurnManagement } from '../utils/TestTurnManagement';

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
    expect(gameStateStub.players[playerId].mana[manaType]).toBe(mana > MAX_MANA ? MAX_MANA : mana); // mana is limited to MAX_MANA
    Object.values(Mana)
      .filter((m) => m !== manaType)
      .forEach((m) => {
        expect(gameStateStub.players[playerId].mana[m]).toBe(0);
      });
  };

  describe('only one initial mage', () => {
    it.each([
      [HeroUnitName.NECROMANCER, Mana.BLACK, PREDEFINED_PLAYERS[1], 7],
      [HeroUnitName.CLERIC, Mana.WHITE, PREDEFINED_PLAYERS[6], 6],
      [HeroUnitName.ENCHANTER, Mana.BLUE, PREDEFINED_PLAYERS[7], 7],
      [HeroUnitName.DRUID, Mana.GREEN, PREDEFINED_PLAYERS[12], 7],
      [HeroUnitName.PYROMANCER, Mana.RED, PREDEFINED_PLAYERS[14], 6],
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
      [HeroUnitName.NECROMANCER, Mana.BLACK, PREDEFINED_PLAYERS[1], 7],
      [HeroUnitName.CLERIC, Mana.WHITE, PREDEFINED_PLAYERS[6], 6],
      [HeroUnitName.ENCHANTER, Mana.BLUE, PREDEFINED_PLAYERS[7], 7],
      [HeroUnitName.DRUID, Mana.GREEN, PREDEFINED_PLAYERS[12], 7],
      [HeroUnitName.PYROMANCER, Mana.RED, PREDEFINED_PLAYERS[14], 6],
    ])(
      'special land has no effect if player (%s) not own them',
      (heroType: HeroUnitType, manaType: ManaType, player: PlayerProfile, inc: number) => {
        it.each(getSpecialLandKinds())('%s not add mana in mana pool', (LandKind: LandType) => {
          expect(player.type).toBe(heroType);

          const players = [player, PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[13]];
          gameStateStub = createGameStateStub({ gamePlayers: players });
          const homeLand = getPlayerLands(gameStateStub).find((l) =>
            hasBuilding(l, BuildingName.STRONGHOLD)
          )!;
          const specialLand = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 2 }; // outside player land
          getLand(gameStateStub, specialLand).land = getLandById(LandKind);

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
      [HeroUnitName.NECROMANCER, Mana.BLACK, PREDEFINED_PLAYERS[1], 7],
      [HeroUnitName.CLERIC, Mana.WHITE, PREDEFINED_PLAYERS[6], 6],
      [HeroUnitName.ENCHANTER, Mana.BLUE, PREDEFINED_PLAYERS[7], 7],
      [HeroUnitName.DRUID, Mana.GREEN, PREDEFINED_PLAYERS[12], 7],
      [HeroUnitName.PYROMANCER, Mana.RED, PREDEFINED_PLAYERS[14], 6],
    ])(
      'special land has no effect if other player then current (%s) own it',
      (heroType: HeroUnitType, manaType: ManaType, player: PlayerProfile, inc: number) => {
        it.each(getSpecialLandKinds())('%s not add mana in mana pool', (LandKind: LandType) => {
          expect(player.type).toBe(heroType);

          const players = [player, PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[13]];
          gameStateStub = createGameStateStub({ gamePlayers: players });
          const homeLandPlayer2 = getPlayerLands(gameStateStub, PREDEFINED_PLAYERS[13].id).find(
            (l) => hasBuilding(l, BuildingName.STRONGHOLD)
          )!;
          const specialLand = {
            row: homeLandPlayer2.mapPos.row,
            col: homeLandPlayer2.mapPos.col + 1,
          }; // player 2 land
          getLand(gameStateStub, specialLand).land = getLandById(LandKind);

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
      [HeroUnitName.NECROMANCER, Mana.BLACK, PREDEFINED_PLAYERS[1], 7],
      [HeroUnitName.CLERIC, Mana.WHITE, PREDEFINED_PLAYERS[6], 6],
      [HeroUnitName.ENCHANTER, Mana.BLUE, PREDEFINED_PLAYERS[7], 7],
      [HeroUnitName.DRUID, Mana.GREEN, PREDEFINED_PLAYERS[12], 7],
      [HeroUnitName.PYROMANCER, Mana.RED, PREDEFINED_PLAYERS[14], 6],
    ])(
      'special land has effect if player (%s) own it and has hero of the related type',
      (heroType: HeroUnitType, manaType: ManaType, player: PlayerProfile, inc: number) => {
        it.each(getSpecialLandKinds())('verify effect of %s on mana pool', (LandKind: LandType) => {
          expect(player.type).toBe(heroType);

          const hasEffect = getManaSource({ landKind: LandKind })?.heroTypes.includes(player.type)!;

          const players = [player, PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[13]];
          gameStateStub = createGameStateStub({ gamePlayers: players });

          const homeLand = getPlayerLands(gameStateStub).find((l) =>
            hasBuilding(l, BuildingName.STRONGHOLD)
          )!;

          const specialLand = { row: homeLand.mapPos.row, col: homeLand.mapPos.col + 1 }; // player land
          getLand(gameStateStub, specialLand).land = getLandById(LandKind);

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
    expectedMana(Mana.BLACK, base[0] * (turn - 2), 0);
    expectedMana(Mana.WHITE, base[1] * (turn - 3), 1);
    expectedMana(Mana.BLUE, base[2] * (turn - 3), 2);
    expectedMana(Mana.GREEN, base[3] * (turn - 3), 3);
    expectedMana(Mana.RED, base[4] * (turn - 3), 4);
  };

  const baseMana = (player: PlayerState) => {
    const realmLands: LandState[] = [];
    player.landsOwned.forEach((l) => realmLands.push(gameStateStub.map.lands[l]));

    const playerSpecialLands = realmLands.filter(
      (l) =>
        (player.playerProfile.type === HeroUnitName.NECROMANCER &&
          (l.land.id === LandName.BLIGHTED_FEN || l.land.id === LandName.SHADOW_MIRE)) ||
        (player.playerProfile.type === HeroUnitName.CLERIC &&
          (l.land.id === LandName.SUN_SPIRE_PEAKS || l.land.id === LandName.GOLDEN_PLAINS)) ||
        (player.playerProfile.type === HeroUnitName.ENCHANTER &&
          (l.land.id === LandName.CRISTAL_BASIN || l.land.id === LandName.MISTY_GLADES)) ||
        (player.playerProfile.type === HeroUnitName.DRUID &&
          (l.land.id === LandName.HEARTWOOD_COVE || l.land.id === LandName.VERDANT_GLADE)) ||
        (player.playerProfile.type === HeroUnitName.PYROMANCER &&
          (l.land.id === LandName.VOLCANO || l.land.id === LandName.LAVA))
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

    for (let i = 0; i < 20; i++) {
      testTurnManagement.makeNTurns(1);
      expectManaOnTurn(gameStateStub.turn, basePlayersMana);
    }
  });

  it('mana increased by 1 per each specific land even if no such hero type when player have TreasureItem.HEARTSTONE_OF_ORRIVANE', () => {
    const players = [PREDEFINED_PLAYERS[1], PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[2]];
    gameStateStub = createGameStateStub({ gamePlayers: players });
    gameStateStub.players[0].empireTreasures.push(
      relictFactory(TreasureName.HEARTSTONE_OF_ORRIVANE)
    );

    const homeLand = getPlayerLands(gameStateStub).find((l) =>
      hasBuilding(l, BuildingName.STRONGHOLD)
    )!;

    getLand(gameStateStub, homeLand.mapPos).land = getLandById(LandName.VOLCANO); // this should add red mana to player 0

    testTurnManagement.setGameState(gameStateStub);
    testTurnManagement.startNewTurn(gameStateStub);
    testTurnManagement.waitStartPhaseComplete();

    expect(gameStateStub.turn).toBe(2);
    gameStateStub.players.forEach((p) => Object.values(p.mana).forEach((m) => expect(m).toBe(0)));

    testTurnManagement.makeNTurns(1);

    expect(gameStateStub.players[0].mana[Mana.RED]).toBe(1);
    expect(gameStateStub.players[0].mana[Mana.BLACK]).toBe(7);
    expect(gameStateStub.players[0].mana[Mana.WHITE]).toBe(0);
    expect(gameStateStub.players[0].mana[Mana.BLUE]).toBe(0);
    expect(gameStateStub.players[0].mana[Mana.GREEN]).toBe(0);
  });
});
