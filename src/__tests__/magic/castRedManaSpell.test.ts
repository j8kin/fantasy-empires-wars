import { LandType } from '../../types/Land';
import { RegularUnitType } from '../../types/UnitType';
import { GameState } from '../../state/GameState';
import { createDefaultGameStateStub } from '../utils/createGameStateStub';
import { getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';
import { getLandById } from '../../domain/land/landRepository';
import { castSpell } from '../../map/magic/castSpell';
import { SpellName } from '../../types/Spell';
import { getArmiesAtPosition } from '../../selectors/armySelectors';
import { UnitRank } from '../../state/army/RegularsState';

describe('castRedManaSpell', () => {
  let gameStateStub: GameState;

  beforeEach(() => {
    gameStateStub = createDefaultGameStateStub();
    getTurnOwner(gameStateStub).mana.red = 200;
  });

  describe('Cast EMBER RAID spell', () => {});
  describe('Cast FORGE OF WAR spell', () => {
    it.each([
      [LandType.PLAINS, RegularUnitType.WARRIOR],
      [LandType.MOUNTAINS, RegularUnitType.DWARF],
      [LandType.GREEN_FOREST, RegularUnitType.ELF],
      [LandType.DARK_FOREST, RegularUnitType.DARK_ELF],
      [LandType.HILLS, RegularUnitType.HALFLING],
      [LandType.SWAMP, RegularUnitType.ORC],
      [LandType.DESERT, RegularUnitType.WARRIOR],
      [LandType.VOLCANO, RegularUnitType.ORC],
      [LandType.LAVA, RegularUnitType.ORC],
      [LandType.SUN_SPIRE_PEAKS, RegularUnitType.DWARF],
      [LandType.GOLDEN_PLAINS, RegularUnitType.DWARF],
      [LandType.HEARTWOOD_COVE, RegularUnitType.ELF],
      [LandType.VERDANT_GLADE, RegularUnitType.ELF],
      [LandType.CRISTAL_BASIN, RegularUnitType.WARRIOR],
      [LandType.MISTY_GLADES, RegularUnitType.WARRIOR],
      [LandType.SHADOW_MIRE, RegularUnitType.ORC],
      [LandType.BLIGHTED_FEN, RegularUnitType.ORC],
    ])(
      'Cast FORGE OF WAR on Land (%s) recruit (%s)',
      (landType: LandType, recruitType: RegularUnitType) => {
        const homeLand = getPlayerLands(gameStateStub)[0];
        homeLand.land = getLandById(landType);
        expect(
          getArmiesAtPosition(gameStateStub, homeLand.mapPos).flatMap((a) => a.regulars)
        ).toHaveLength(0);

        castSpell(gameStateStub, SpellName.FORGE_OF_WAR, homeLand.mapPos);

        const regulars = getArmiesAtPosition(gameStateStub, homeLand.mapPos).flatMap(
          (a) => a.regulars
        );
        expect(regulars).toHaveLength(1);
        expect(regulars[0].type).toBe(recruitType);
        expect(regulars[0].count).toBe(60);
        expect(regulars[0].rank).toBe(UnitRank.REGULAR);
      }
    );
  });
  describe('Cast FIRESTORM spell', () => {});
  describe('Cast METEOR SHOWER spell', () => {});
});
