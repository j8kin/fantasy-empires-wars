import { GameState } from '../../state/GameState';
import { LandPosition } from '../../state/map/land/LandPosition';
import { getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';
import { getSpellById } from '../../selectors/spellSelectors';
import { findArmyById, getArmiesAtPosition } from '../../selectors/armySelectors';
import { getLand, getLandInfo } from '../../selectors/landSelectors';
import { regularsFactory } from '../../factories/regularsFactory';
import { heroFactory } from '../../factories/heroFactory';

import { HeroUnitType, RegularUnitType } from '../../types/UnitType';
import { SpellName } from '../../types/Spell';
import { BuildingType } from '../../types/Building';

import { castSpell } from '../../map/magic/castSpell';

import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { placeUnitsOnMap } from '../utils/placeUnitsOnMap';
import { TestTurnManagement } from '../utils/TestTurnManagement';

describe('castWhiteManaSpell', () => {
  let randomSpy: jest.SpyInstance<number, []>;

  let gameStateStub: GameState;
  let opponentLand: LandPosition;

  beforeEach(() => {
    randomSpy = jest.spyOn(Math, 'random');

    gameStateStub = createDefaultGameStateStub();
    getTurnOwner(gameStateStub).mana.white = 200;
    placeUnitsOnMap(
      heroFactory(HeroUnitType.CLERIC, 'Cleric Level 1'),
      gameStateStub,
      getPlayerLands(gameStateStub)[0].mapPos
    );
    opponentLand = getPlayerLands(gameStateStub, gameStateStub.players[1].id)[0].mapPos;
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  describe('Cast TURN_TO_MANA spell', () => {
    it('Number of UNDEAD units decremented', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitType.UNDEAD, 120), gameStateStub, opponentLand);

      randomSpy.mockReturnValue(0.99); // maximize damage from spell

      castSpell(gameStateStub, getSpellById(SpellName.TURN_UNDEAD), opponentLand);

      const undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.UNDEAD)
      );
      expect(undeadArmy).toBeDefined();
      expect(undeadArmy?.regulars.length).toBe(1);
      expect(undeadArmy?.regulars[0].type).toBe(RegularUnitType.UNDEAD);
      expect(undeadArmy?.regulars[0].count).toBe(58); // ceil(60 * (1 + 1 / 32)) = 62 - spell killed only 62 undead units
    });

    it('Army destroyed if all units killed', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitType.UNDEAD, 2), gameStateStub, opponentLand);

      randomSpy.mockReturnValue(0.99); // maximize damage from spell
      const undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.UNDEAD)
      )!;

      castSpell(gameStateStub, getSpellById(SpellName.TURN_UNDEAD), opponentLand);

      expect(findArmyById(gameStateStub, undeadArmy.id)).toBeUndefined(); // army destroyed
      expect(
        getArmiesAtPosition(gameStateStub, opponentLand).filter((a) =>
          a.regulars.some((r) => r.type === RegularUnitType.UNDEAD)
        )
      ).toHaveLength(0); // no UNDEAD armies left
    });

    it('TURN UNDEAD should be casted only once per turn', () => {
      placeUnitsOnMap(regularsFactory(RegularUnitType.UNDEAD, 120), gameStateStub, opponentLand);

      randomSpy.mockReturnValue(1); // maximize damage from spell

      castSpell(gameStateStub, getSpellById(SpellName.TURN_UNDEAD), opponentLand);

      let undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.UNDEAD)
      );
      expect(undeadArmy).toBeDefined();
      expect(undeadArmy?.regulars.length).toBe(1);
      expect(undeadArmy?.regulars[0].type).toBe(RegularUnitType.UNDEAD);
      expect(undeadArmy?.regulars[0].count).toBe(58); // ceil(60 * (1 + 1 / 32)) = 62 - spell killed only 62 undead units

      castSpell(gameStateStub, getSpellById(SpellName.TURN_UNDEAD), opponentLand);

      // check that spell is not affected by the second cast
      undeadArmy = getArmiesAtPosition(gameStateStub, opponentLand).find((a) =>
        a.regulars.some((u) => u.type === RegularUnitType.UNDEAD)
      );

      expect(undeadArmy).toBeDefined();
      expect(undeadArmy?.regulars.length).toBe(1);
      expect(undeadArmy?.regulars[0].type).toBe(RegularUnitType.UNDEAD);
      expect(undeadArmy?.regulars[0].count).toBe(58); // the same as in the first cast
    });
  });

  describe('Cast VIEW TERRITORY spell', () => {
    let testTurnManagement: TestTurnManagement;
    let gameStateStub: GameState;

    beforeEach(() => {
      jest.useFakeTimers();
      jest.clearAllMocks();

      gameStateStub = createDefaultGameStateStub();
      getTurnOwner(gameStateStub).mana.white = 200; // to allow casting spells
      testTurnManagement = new TestTurnManagement(gameStateStub);

      testTurnManagement.startNewTurn(gameStateStub);
      testTurnManagement.waitStartPhaseComplete();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should decrement effect durations at the end of startTurn execution and remove with 0 duration', () => {
      expect(gameStateStub.turn).toBe(2);

      // opponent land 0 is homeland: have an initial hero and stronghold
      const opponentLand = getPlayerLands(gameStateStub, gameStateStub.players[1].id)[0].mapPos;
      placeUnitsOnMap(regularsFactory(RegularUnitType.UNDEAD, 1), gameStateStub, opponentLand);

      const landInfo = getLandInfo(gameStateStub, opponentLand);
      // verify that effect not added to the land yet
      expect(landInfo.heroes).toHaveLength(0);
      expect(landInfo.regulars).toHaveLength(0);
      expect(landInfo.buildings).toHaveLength(0);

      castSpell(gameStateStub, getSpellById(SpellName.VIEW_TERRITORY), opponentLand);

      // verify that effect added to the land
      const land = getLand(gameStateStub, opponentLand);
      expect(land.effects).toHaveLength(1);
      expect(land.effects[0].spell).toBe(SpellName.VIEW_TERRITORY);
      expect(land.effects[0].duration).toBe(1);

      expect(land.effects[0].castBy).toBe(gameStateStub.turnOwner);

      const landInfoWithEffect = getLandInfo(gameStateStub, opponentLand);
      // verify that effect not added to the land yet
      expect(landInfoWithEffect.heroes).toHaveLength(1);
      expect(landInfoWithEffect.heroes[0]).toBe('Morgana Shadowweaver lvl: 12');
      expect(landInfoWithEffect.regulars).toHaveLength(1);
      expect(landInfoWithEffect.regulars[0]).toBe(`${RegularUnitType.UNDEAD} (1)`);
      expect(landInfoWithEffect.buildings).toHaveLength(1);
      expect(landInfoWithEffect.buildings[0]).toBe(BuildingType.STRONGHOLD);

      testTurnManagement.makeNTurns(1);

      // effect disappear since duration 1 turn
      expect(gameStateStub.turn).toBe(3);
      expect(getLand(gameStateStub, opponentLand).effects).toHaveLength(0);
    });
  });
});
