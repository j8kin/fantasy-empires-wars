import { getTurnOwner } from '../../selectors/playerSelectors';
import { getArmiesAtPosition, isMoving } from '../../selectors/armySelectors';
import { getLandOwner, getPlayerLands } from '../../selectors/landSelectors';
import { getSpellById } from '../../selectors/spellSelectors';
import { levelUpHero } from '../../systems/unitsActions';
import { startMoving } from '../../systems/armyActions';
import { heroFactory } from '../../factories/heroFactory';
import { regularsFactory } from '../../factories/regularsFactory';
import { castSpell } from '../../map/magic/castSpell';
import { HeroUnitName, RegularUnitName } from '../../types/UnitType';
import { Alignment } from '../../types/Alignment';
import { SpellName } from '../../types/Spell';
import { EffectKind } from '../../types/Effect';
import { Mana } from '../../types/Mana';
import { UnitRank } from '../../state/army/RegularsState';
import type { GameState } from '../../state/GameState';
import type { PlayerState } from '../../state/player/PlayerState';
import type { AlignmentType } from '../../types/Alignment';
import type { ManaType } from '../../types/Mana';

import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { placeUnitsOnMap } from '../utils/placeUnitsOnMap';

describe('castBlueManaSpell', () => {
  let gameStateStub: GameState;

  beforeEach(() => {
    gameStateStub = createDefaultGameStateStub();
    getTurnOwner(gameStateStub).mana.blue = 200;
  });

  describe('Cast VEIL OF MISDIRECTION spell', () => {
    it.each([
      [1, 0],
      [2, 1],
      [2, 5],
      [3, 6],
      [3, 10],
      [4, 11],
      [4, 16],
      [5, 17],
      [5, 21],
      [6, 22],
      [6, 26],
      [7, 27], // for level 27 and above all lands in radius 1 are protected from VIEW TERRITORY spell
    ])(
      'Number of lands affected by VEIL OF MISDIRECTION spell: %s based on max Enchanter level: %s',
      (nLands: number, maxEnchanterLevel: number) => {
        const homeLandPos = getPlayerLands(gameStateStub)[0].mapPos;

        if (maxEnchanterLevel > 0) {
          // add ENCHANTER on Map
          const hero = heroFactory(HeroUnitName.ENCHANTER, `Enchanter Level ${maxEnchanterLevel}`);
          while (hero.level < maxEnchanterLevel) levelUpHero(hero, Alignment.LAWFUL);
          placeUnitsOnMap(hero, gameStateStub, getPlayerLands(gameStateStub)[0].mapPos);
        }

        const blueMana = getTurnOwner(gameStateStub).mana.blue;
        castSpell(gameStateStub, SpellName.ILLUSION, homeLandPos);
        expect(getTurnOwner(gameStateStub).mana.blue).toBe(
          blueMana - getSpellById(SpellName.ILLUSION).manaCost
        );

        const affectedLands = getPlayerLands(gameStateStub).filter((l) => l.effects.length > 0);
        expect(affectedLands).toHaveLength(nLands);
        affectedLands.forEach((l) => {
          expect(l.effects).toHaveLength(1);
          expect(l.effects[0].sourceId).toBe(SpellName.ILLUSION);
          expect(l.effects[0].rules.type).toBe(EffectKind.POSITIVE);
          expect(l.effects[0].rules.duration).toBe(3);
          expect(l.effects[0].appliedBy).toBe(gameStateStub.turnOwner);
        });
      }
    );
  });

  describe('Cast TELEPORT spell', () => {
    it('Stationed Army should be teleported', () => {
      const lands = getPlayerLands(gameStateStub);
      const fromPos = lands[1].mapPos;
      const toPos = lands[4].mapPos;
      placeUnitsOnMap(regularsFactory(RegularUnitName.HALFLING, 120), gameStateStub, fromPos);
      expect(isMoving(getArmiesAtPosition(gameStateStub, fromPos)[0])).toBeFalsy();

      const blueMana = getTurnOwner(gameStateStub).mana.blue;
      castSpell(gameStateStub, SpellName.TELEPORT, fromPos, toPos);
      expect(getTurnOwner(gameStateStub).mana.blue).toBe(
        blueMana - getSpellById(SpellName.TELEPORT).manaCost
      );

      expect(getArmiesAtPosition(gameStateStub, fromPos)).toHaveLength(0);
      const teleportedArmy = getArmiesAtPosition(gameStateStub, toPos);
      expect(teleportedArmy).toHaveLength(1);
      expect(teleportedArmy[0].regulars).toHaveLength(1);
      expect(teleportedArmy[0].regulars[0].type).toBe(RegularUnitName.HALFLING);
      expect(teleportedArmy[0].regulars[0].count).toBe(120);
      expect(isMoving(teleportedArmy[0])).toBeFalsy();
    });

    it('moving Army should be teleported and became stational', () => {
      const lands = getPlayerLands(gameStateStub);
      const fromPos = lands[1].mapPos;
      const toPos = lands[4].mapPos;
      placeUnitsOnMap(regularsFactory(RegularUnitName.HALFLING, 120), gameStateStub, fromPos);
      const movingArmy = getArmiesAtPosition(gameStateStub, fromPos)[0];
      startMoving(movingArmy, lands[3].mapPos); // start moving to another land
      expect(isMoving(getArmiesAtPosition(gameStateStub, fromPos)[0])).toBeTruthy();

      castSpell(gameStateStub, SpellName.TELEPORT, fromPos, toPos);

      expect(getArmiesAtPosition(gameStateStub, fromPos)).toHaveLength(0);
      expect(getArmiesAtPosition(gameStateStub, lands[3].mapPos)).toHaveLength(0);

      const teleportedArmy = getArmiesAtPosition(gameStateStub, toPos);
      expect(teleportedArmy).toHaveLength(1);
      expect(teleportedArmy[0].regulars).toHaveLength(1);
      expect(teleportedArmy[0].regulars[0].type).toBe(RegularUnitName.HALFLING);
      expect(teleportedArmy[0].regulars[0].count).toBe(120);
      expect(isMoving(teleportedArmy[0])).toBeFalsy(); // teleported army should became stational
    });

    it('Only players army should be teleported', () => {
      const lands = getPlayerLands(gameStateStub);
      const fromPos = lands[1].mapPos;
      const toPos = lands[4].mapPos;
      placeUnitsOnMap(regularsFactory(RegularUnitName.HALFLING, 120), gameStateStub, fromPos); // players army
      gameStateStub.turnOwner = gameStateStub.players[1].id;
      placeUnitsOnMap(regularsFactory(RegularUnitName.WARD_HANDS, 120), gameStateStub, fromPos); // opponent army
      expect(getArmiesAtPosition(gameStateStub, fromPos)).toHaveLength(2);

      gameStateStub.turnOwner = gameStateStub.players[0].id; // change back turn owner to player 0

      castSpell(gameStateStub, SpellName.TELEPORT, fromPos, toPos);

      const player2Army = getArmiesAtPosition(gameStateStub, fromPos);
      expect(player2Army).toHaveLength(1);
      expect(player2Army[0].regulars).toHaveLength(1);
      expect(player2Army[0].regulars[0].type).toBe(RegularUnitName.WARD_HANDS);
      expect(player2Army[0].regulars[0].count).toBe(120);

      const teleportedArmy = getArmiesAtPosition(gameStateStub, toPos);
      expect(teleportedArmy).toHaveLength(1);
      expect(teleportedArmy[0].regulars).toHaveLength(1);
      expect(teleportedArmy[0].regulars[0].type).toBe(RegularUnitName.HALFLING);
      expect(teleportedArmy[0].regulars[0].count).toBe(120);
    });

    it('Corner case: teleport on uncontrolled land should not worked', () => {
      const homeLandPos = getPlayerLands(gameStateStub)[0].mapPos;
      expect(getArmiesAtPosition(gameStateStub, homeLandPos)).toHaveLength(1); // hero is present
      const outerLandPos = { row: homeLandPos.row + 2, col: homeLandPos.col + 2 };
      expect(getLandOwner(gameStateStub, outerLandPos)).not.toBe(gameStateStub.turnOwner);

      castSpell(gameStateStub, SpellName.TELEPORT, homeLandPos, outerLandPos);

      expect(getArmiesAtPosition(gameStateStub, homeLandPos)).toHaveLength(1);
      expect(getArmiesAtPosition(gameStateStub, outerLandPos)).toHaveLength(0);
    });
  });

  describe('Cast TORNADO spell', () => {
    it.each([0, 1, 32])(
      'number of killed is not related on max Enchanter level: %s',
      (maxEnchanterLevel: number) => {
        if (maxEnchanterLevel > 0) {
          // add ENCHANTER on Map
          const hero = heroFactory(HeroUnitName.ENCHANTER, `Enchanter Level ${maxEnchanterLevel}`);
          while (hero.level < maxEnchanterLevel) levelUpHero(hero, Alignment.LAWFUL);
          placeUnitsOnMap(hero, gameStateStub, getPlayerLands(gameStateStub)[0].mapPos);
        }

        gameStateStub.turnOwner = gameStateStub.players[1].id;
        const opponentLandPos = getPlayerLands(gameStateStub)[1].mapPos;
        placeUnitsOnMap(regularsFactory(RegularUnitName.ORC, 120), gameStateStub, opponentLandPos);
        expect(getArmiesAtPosition(gameStateStub, opponentLandPos)).toHaveLength(1);

        gameStateStub.turnOwner = gameStateStub.players[0].id; // cast Tornado from player 0 on Player 1's land'

        const randomSpy: jest.SpyInstance<number, []> = jest.spyOn(Math, 'random');
        randomSpy.mockReturnValue(0.99); // maximize damage from spell

        const blueMana = getTurnOwner(gameStateStub).mana.blue;
        castSpell(gameStateStub, SpellName.TORNADO, opponentLandPos);
        expect(getTurnOwner(gameStateStub).mana.blue).toBe(
          blueMana - getSpellById(SpellName.TORNADO).manaCost
        );

        const opponentArmy = getArmiesAtPosition(gameStateStub, opponentLandPos);
        expect(opponentArmy).toHaveLength(1);
        expect(opponentArmy[0].regulars).toHaveLength(1);
        expect(opponentArmy[0].regulars[0].type).toBe(RegularUnitName.ORC);
        expect(opponentArmy[0].regulars[0].rank).toBe(UnitRank.REGULAR);
        expect(opponentArmy[0].regulars[0].count).toBe(78);

        randomSpy.mockRestore();
      }
    );

    it('Corner case: Tornado kill at least 5 units and destroy army', () => {
      const opponentLandPos = getPlayerLands(gameStateStub)[1].mapPos;
      placeUnitsOnMap(regularsFactory(RegularUnitName.ORC, 5), gameStateStub, opponentLandPos);
      expect(getArmiesAtPosition(gameStateStub, opponentLandPos)).toHaveLength(1);

      gameStateStub.turnOwner = gameStateStub.players[1].id; // cast Tornado from player 1 on Player 0's land'

      castSpell(gameStateStub, SpellName.TORNADO, opponentLandPos);

      expect(getArmiesAtPosition(gameStateStub, opponentLandPos)).toHaveLength(0);
    });
  });

  describe('Cast ARCANE EXCHANGE spell', () => {
    it.each([
      [90, Mana.WHITE, Alignment.LAWFUL],
      [90, Mana.GREEN, Alignment.LAWFUL],
      [75, Mana.RED, Alignment.LAWFUL],
      [50, Mana.BLACK, Alignment.LAWFUL],
      [95, Mana.WHITE, Alignment.NEUTRAL],
      [95, Mana.GREEN, Alignment.NEUTRAL],
      [95, Mana.RED, Alignment.NEUTRAL],
      [95, Mana.BLACK, Alignment.NEUTRAL],
      [50, Mana.WHITE, Alignment.CHAOTIC],
      [75, Mana.GREEN, Alignment.CHAOTIC],
      [90, Mana.RED, Alignment.CHAOTIC],
      [90, Mana.BLACK, Alignment.CHAOTIC],
    ])(
      '100 Blue mana exchanged into %s %s mana for %s player',
      (mana: number, newManaType: ManaType, playerAlignment: AlignmentType) => {
        let player: PlayerState;
        switch (playerAlignment) {
          case Alignment.LAWFUL:
            player = gameStateStub.players[0];
            break;
          case Alignment.NEUTRAL:
            player = gameStateStub.players[2];
            break;
          case Alignment.CHAOTIC:
            player = gameStateStub.players[1];
            break;
          default:
            throw new Error('Invalid player alignment');
        }

        gameStateStub.turnOwner = player.id;
        const turnOwnerMana = getTurnOwner(gameStateStub).mana;
        turnOwnerMana[Mana.BLUE] = 200;
        turnOwnerMana[Mana.WHITE] = 0;
        turnOwnerMana[Mana.GREEN] = 0;
        turnOwnerMana[Mana.RED] = 0;
        turnOwnerMana[Mana.BLACK] = 0;

        castSpell(gameStateStub, SpellName.EXCHANGE, undefined, undefined, newManaType);

        expect(getTurnOwner(gameStateStub).mana[Mana.BLUE]).toBe(100);
        expect(getTurnOwner(gameStateStub).mana[newManaType]).toBe(mana);
      }
    );
  });
});
