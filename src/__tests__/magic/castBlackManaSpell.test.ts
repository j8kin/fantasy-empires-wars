import { getTurnOwner } from '../../selectors/playerSelectors';
import { getArmiesAtPositionByPlayers, getArmiesByPlayer, getMaxHeroLevelByType } from '../../selectors/armySelectors';
import { getSpellById } from '../../selectors/spellSelectors';
import { getLand, getPlayerLands } from '../../selectors/landSelectors';
import { levelUpHero } from '../../systems/unitsActions';
import { regularsFactory } from '../../factories/regularsFactory';
import { heroFactory } from '../../factories/heroFactory';
import { getLandGoldPerTurn, getLandUnitsToRecruit } from '../../domain/land/landRepository';
import { isMageType } from '../../domain/unit/unitTypeChecks';
import { castSpell } from '../../map/magic/castSpell';
import { Doctrine } from '../../state/player/PlayerProfile';
import { HeroUnitName, RegularUnitName, WarMachineName } from '../../types/UnitType';
import { UnitRank } from '../../state/army/RegularsState';
import { SpellName } from '../../types/Spell';
import { BuildingName } from '../../types/Building';
import { LandName } from '../../types/Land';
import type { GameState } from '../../state/GameState';
import type { LandType } from '../../types/Land';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { UnitType } from '../../types/UnitType';

import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { placeUnitsOnMap } from '../utils/placeUnitsOnMap';

describe('castBlackManaSpell', () => {
  let randomSpy: jest.SpyInstance<number, []>;

  let gameStateStub: GameState;

  beforeEach(() => {
    randomSpy = jest.spyOn(Math, 'random');

    gameStateStub = createDefaultGameStateStub();
    getTurnOwner(gameStateStub).mana.black = 200;
    expect(getMaxHeroLevelByType(gameStateStub, HeroUnitName.NECROMANCER)).toBe(0); // no Necromancers on the map
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  describe('Cast SUMMON UNDEAD spell', () => {
    beforeEach(() => {
      randomSpy.mockReturnValue(0.99); // maximize number of UNDEAD units to be summoned
    });

    it('Allow Summoned UNDEAD units when no Necromancer but enough mana', () => {
      const nNecromancers = getArmiesByPlayer(gameStateStub).find((a) =>
        a.heroes.some((h) => h.type === HeroUnitName.NECROMANCER)
      );
      expect(nNecromancers).toBeUndefined(); // no Necromancers on the map

      const playerLandPos = getPlayerLands(gameStateStub)[1].mapPos; // land[0] is Homeland and has default hero that is why use [1]
      expect(getArmiesAtPositionByPlayers(gameStateStub, playerLandPos, [gameStateStub.turnOwner])).toHaveLength(0);

      const blackMana = getTurnOwner(gameStateStub).mana.black;
      castSpell(gameStateStub, SpellName.SUMMON_UNDEAD, playerLandPos);
      expect(getTurnOwner(gameStateStub).mana.black).toBe(blackMana - getSpellById(SpellName.SUMMON_UNDEAD).manaCost);

      const undeadArmy = getArmiesAtPositionByPlayers(gameStateStub, playerLandPos, [gameStateStub.turnOwner]);
      expect(undeadArmy).toHaveLength(1); // new army created
      expect(undeadArmy[0].regulars).toHaveLength(1); // only undead regulars
      expect(undeadArmy[0].regulars[0].type).toBe(RegularUnitName.UNDEAD);
      expect(undeadArmy[0].regulars[0].rank).toBe(UnitRank.REGULAR);
      expect(undeadArmy[0].regulars[0].count).toBe(60);
    });

    it('When Undead already exist on Land add to existing units during SUMMON UNDEAD', () => {
      const playerLandPos = getPlayerLands(gameStateStub)[1].mapPos; // land[0] is Homeland and has default hero that is why use [1]
      placeUnitsOnMap(regularsFactory(RegularUnitName.UNDEAD, 1), gameStateStub, playerLandPos);

      castSpell(gameStateStub, SpellName.SUMMON_UNDEAD, playerLandPos);

      const undeadArmies = getArmiesAtPositionByPlayers(gameStateStub, playerLandPos, [gameStateStub.turnOwner]);

      expect(undeadArmies).toHaveLength(1); // not increased
      expect(undeadArmies[0].regulars).toHaveLength(1);
      expect(undeadArmies[0].regulars[0].type).toBe(RegularUnitName.UNDEAD);
      expect(undeadArmies[0].regulars[0].rank).toBe(UnitRank.REGULAR);
      expect(undeadArmies[0].regulars[0].count).toBe(61); // 60 units added
    });

    it.each([
      [1, 62],
      [16, 90],
      [32, 120],
    ])('Number of UNDEAD units depends on max Necromancer level (%s): %s', (maxLevel: number, summoned: number) => {
      const playerLandPos = getPlayerLands(gameStateStub)[0].mapPos;

      const necromancer = heroFactory(HeroUnitName.NECROMANCER, `Necromancer Level ${maxLevel}`);

      while (necromancer.level < maxLevel) {
        levelUpHero(necromancer, Doctrine.MELEE);
      }
      expect(necromancer.level).toBe(maxLevel);
      placeUnitsOnMap(necromancer, gameStateStub, playerLandPos);

      castSpell(gameStateStub, SpellName.SUMMON_UNDEAD, playerLandPos);

      const summonedUndead = getArmiesAtPositionByPlayers(gameStateStub, playerLandPos, [
        gameStateStub.turnOwner,
      ]).flatMap((r) => r.regulars);
      expect(summonedUndead).toHaveLength(1);
      expect(summonedUndead[0].type).toBe(RegularUnitName.UNDEAD);
      expect(summonedUndead[0].rank).toBe(UnitRank.REGULAR);
      expect(summonedUndead[0].count).toBe(summoned);
    });
  });

  describe('Cast PLAGUE spell', () => {
    it.each([0, 1, 32])('Number of killed units NOT depends on max Necromancer level (%s)', (maxLevel: number) => {
      const playerLandPos = getPlayerLands(gameStateStub)[0].mapPos;
      if (maxLevel > 0) {
        const necromancer = heroFactory(HeroUnitName.NECROMANCER, `Necromancer Lvl ${maxLevel}`);
        while (necromancer.level < maxLevel) {
          levelUpHero(necromancer, Doctrine.MAGIC);
        }
        placeUnitsOnMap(necromancer, gameStateStub, playerLandPos);
      }

      // change turn Owner to Opponent and place Opponent army
      const opponentLandPos = getPlayerLands(gameStateStub, gameStateStub.players[1].id)[0].mapPos;
      gameStateStub.turnOwner = gameStateStub.players[1].id;
      placeUnitsOnMap(regularsFactory(RegularUnitName.ORC, 120), gameStateStub, opponentLandPos);
      gameStateStub.turnOwner = gameStateStub.players[0].id;

      randomSpy.mockReturnValue(0.99); // maximize damage from spell to make test stable
      castSpell(gameStateStub, SpellName.PLAGUE, opponentLandPos);

      expect(getArmiesAtPositionByPlayers(gameStateStub, opponentLandPos, [gameStateStub.players[1].id])).toHaveLength(
        2
      );

      const regulars = getArmiesAtPositionByPlayers(gameStateStub, opponentLandPos, [
        gameStateStub.players[1].id,
      ]).flatMap((r) => r.regulars);

      expect(regulars).toHaveLength(1); // only orcs
      expect(regulars[0].count).toBe(120 - 48);
    });
  });

  describe('Cast CORRUPTION spell', () => {
    const affectedLandType: LandType[] = [LandName.MOUNTAINS, LandName.PLAINS, LandName.GREEN_FOREST, LandName.HILLS];

    it('CORRUPTION Could be cast only radius 2 STRONGHOLD', () => {
      const homelandPos = getPlayerLands(gameStateStub)[0].mapPos;
      expect(getLand(gameStateStub, homelandPos).buildings[0].type).toBe(BuildingName.STRONGHOLD);
      let castPosition: LandPosition = { row: homelandPos.row + 1, col: homelandPos.col };
      expect(getLand(gameStateStub, castPosition).corrupted).toBeFalsy();

      const blackMana = getTurnOwner(gameStateStub).mana.black;
      castSpell(gameStateStub, SpellName.CORRUPTION, castPosition);
      expect(getTurnOwner(gameStateStub).mana.black).toBe(blackMana - getSpellById(SpellName.CORRUPTION).manaCost);
      expect(getLand(gameStateStub, castPosition).corrupted).toBeTruthy();
      expect(getLand(gameStateStub, castPosition).goldPerTurn).toBe(
        getLandGoldPerTurn(getLand(gameStateStub, castPosition).type).max
      ); // player land gold production maximized

      getTurnOwner(gameStateStub).mana.black = 200; // refill mana
      castPosition = { row: homelandPos.row + 2, col: homelandPos.col };
      expect(getLand(gameStateStub, castPosition).corrupted).toBeFalsy();

      castSpell(gameStateStub, SpellName.CORRUPTION, castPosition);
      expect(getLand(gameStateStub, castPosition).corrupted).toBeTruthy();
      expect(getLand(gameStateStub, castPosition).goldPerTurn).toBe(
        getLandGoldPerTurn(getLand(gameStateStub, castPosition).type).min
      ); // non-player land gold production minimized

      getTurnOwner(gameStateStub).mana.black = 200; // refill mana
      castPosition = { row: homelandPos.row + 3, col: homelandPos.col };
      expect(getLand(gameStateStub, castPosition).corrupted).toBeFalsy();

      castSpell(gameStateStub, SpellName.CORRUPTION, castPosition);
      expect(getTurnOwner(gameStateStub).mana.black).toBe(200); // not used since spell not casted
      expect(getLand(gameStateStub, castPosition).corrupted).toBeFalsy();
    });

    it.each([...affectedLandType])('Only %s land type is affected by CURRUPTION spell', (landType: LandType) => {
      const homelandPos = getPlayerLands(gameStateStub)[0].mapPos;
      let castPosition: LandPosition = { row: homelandPos.row + 1, col: homelandPos.col };
      getLand(gameStateStub, castPosition).type = landType;
      expect(getLand(gameStateStub, castPosition).corrupted).toBeFalsy();

      castSpell(gameStateStub, SpellName.CORRUPTION, castPosition);
      const corruptedLand = getLand(gameStateStub, castPosition);
      expect(corruptedLand.corrupted).toBeTruthy();

      let availableForRecruit: UnitType[] = [
        RegularUnitName.ORC,
        HeroUnitName.OGR,
        ...Object.values(WarMachineName),
        ...Object.values(HeroUnitName).filter((unit) => isMageType(unit)),
      ];
      if (landType === LandName.GREEN_FOREST) {
        availableForRecruit.push(RegularUnitName.DARK_ELF);
        availableForRecruit.push(HeroUnitName.SHADOW_BLADE);
      }

      const corruptedLandUnits = getLandUnitsToRecruit(corruptedLand.type, corruptedLand.corrupted);
      corruptedLandUnits.forEach((unit) => expect(availableForRecruit).toContain(unit));
      availableForRecruit.forEach((unit) => expect(corruptedLandUnits).toContain(unit));
    });

    it.each(
      Object.values(LandName)
        .filter((l) => !affectedLandType.includes(l))
        .map((l) => [l])
    )('Land type %s is not affected by CURRUPTION spell', (landKind: LandType) => {
      const homelandPos = getPlayerLands(gameStateStub)[0].mapPos;
      let castPosition: LandPosition = { row: homelandPos.row + 1, col: homelandPos.col };
      getLand(gameStateStub, castPosition).type = landKind;
      expect(getLand(gameStateStub, castPosition).corrupted).toBeFalsy();

      castSpell(gameStateStub, SpellName.CORRUPTION, castPosition);
      expect(getTurnOwner(gameStateStub).mana.black).toBe(200);
      expect(getLand(gameStateStub, castPosition).corrupted).toBeFalsy();
    });
  });
});
