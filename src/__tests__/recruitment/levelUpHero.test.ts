import { levelUpHero } from '../../systems/unitsActions';
import { playerFactory } from '../../factories/playerFactory';
import { heroFactory } from '../../factories/heroFactory';
import { artifactFactory } from '../../factories/treasureFactory';
import { PREDEFINED_PLAYERS } from '../../domain/player/playerRepository';
import { TreasureName } from '../../types/Treasures';
import { HeroUnitName } from '../../types/UnitType';
import type { HeroUnitType } from '../../types/UnitType';
import type { PlayerProfile } from '../../state/player/PlayerProfile';

describe('level up hero', () => {
  it.each([
    [
      HeroUnitName.FIGHTER,
      1,
      PREDEFINED_PLAYERS[0],
      { attack: 34, defense: 3, range: 2, rangeDamage: 33, speed: 5, mana: undefined },
    ],
    [
      HeroUnitName.NECROMANCER,
      1,
      PREDEFINED_PLAYERS[1],
      { attack: 35, defense: 2, range: 25, rangeDamage: 37, speed: 3, mana: 1 },
    ],
    [
      HeroUnitName.FIGHTER,
      9,
      PREDEFINED_PLAYERS[0],
      { attack: 52, defense: 6, range: 2, rangeDamage: 49, speed: 5, mana: undefined },
    ],
    [
      HeroUnitName.NECROMANCER,
      9,
      PREDEFINED_PLAYERS[1],
      { attack: 38, defense: 5, range: 25, rangeDamage: 49, speed: 3, mana: 5 },
    ],
    [
      HeroUnitName.FIGHTER,
      31,
      PREDEFINED_PLAYERS[0],
      { attack: 128, defense: 18, range: 2, rangeDamage: 115, speed: 5, mana: undefined },
    ],
    [
      HeroUnitName.NECROMANCER,
      31,
      PREDEFINED_PLAYERS[1],
      { attack: 51, defense: 15, range: 25, rangeDamage: 96, speed: 3, mana: 20 },
    ],
    [
      HeroUnitName.ENCHANTER,
      31,
      PREDEFINED_PLAYERS[7],
      { attack: 63, defense: 16, range: 35, rangeDamage: 15, speed: 3, mana: 32 },
    ],
    [
      HeroUnitName.CLERIC,
      31,
      PREDEFINED_PLAYERS[6],
      { attack: 106, defense: 18, range: 2, rangeDamage: 110, speed: 3, mana: 20 },
    ],
    [
      HeroUnitName.DRUID,
      31,
      PREDEFINED_PLAYERS[12],
      { attack: 101, defense: 17, range: 2, rangeDamage: 105, speed: 4, mana: 20 },
    ],
    [
      HeroUnitName.PYROMANCER,
      31,
      PREDEFINED_PLAYERS[14],
      { attack: 46, defense: 16, range: 30, rangeDamage: 91, speed: 3, mana: 20 },
    ],
  ])(
    'should increase characteristics when hero (%s) level %s gain new level',
    (playerType: HeroUnitType, initLevel: number, player: PlayerProfile, expected) => {
      expect(player.type).toBe(playerType);

      const hero = heroFactory(player.type, player.name);

      while (hero.level < initLevel) levelUpHero(hero, player.doctrine); // set initial level

      levelUpHero(hero, player.doctrine); // increase level

      expect(hero.level).toBe(initLevel + 1);
      expect(hero.combatStats.attack).toBe(expected.attack);
      expect(hero.combatStats.defense).toBe(expected.defense);
      expect(hero.combatStats.range).toBe(expected.range);
      expect(hero.combatStats.rangeDamage).toBe(expected.rangeDamage);
      expect(hero.combatStats.speed).toBe(expected.speed);
      expect(hero.mana).toBe(expected.mana);
    }
  );

  it('Ring of the Ascendant (RING_OF_EXPERIENCE) artifact increment level by 2', () => {
    const player = playerFactory(PREDEFINED_PLAYERS[0], 'human', 200000);
    const playerProfile = player.playerProfile;
    const hero1 = heroFactory(playerProfile.type, 'Hero 1');
    const hero2 = heroFactory(playerProfile.type, 'Hero 2');
    hero2.artifacts.push(artifactFactory(TreasureName.RING_OF_EXPERIENCE, 1));

    levelUpHero(hero1, playerProfile.doctrine);
    levelUpHero(hero2, playerProfile.doctrine);

    expect(hero1.level).toBe(2);
    expect(hero2.level).toBe(3);
  });

  it('level up after 32 is not possible', () => {
    const player = playerFactory(PREDEFINED_PLAYERS[0], 'human', 200000);
    const playerProfile = player.playerProfile;
    const hero1 = heroFactory(playerProfile.type, 'Hero 1');
    while (hero1.level < 32) levelUpHero(hero1, playerProfile.doctrine); // gain initial level: 32
    expect(hero1.level).toBe(32);
    const hero2 = heroFactory(playerProfile.type, 'Hero 2');
    while (hero2.level < 31) levelUpHero(hero2, playerProfile.doctrine); // gain initial level: 31
    expect(hero2.level).toBe(31);
    hero2.artifacts.push(artifactFactory(TreasureName.RING_OF_EXPERIENCE, 1));

    levelUpHero(hero1, playerProfile.doctrine);
    levelUpHero(hero2, playerProfile.doctrine);

    expect(hero1.level).toBe(32);
    expect(hero2.level).toBe(32);
  });
});
