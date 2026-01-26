import { getTurnOwner, isPlayerDoctrine } from '../../selectors/playerSelectors';
import { getRealmLands, hasActiveEffect, hasBuilding } from '../../selectors/landSelectors';
import { getLandAlignment } from '../../domain/land/landRepository';
import { Doctrine } from '../../state/player/PlayerProfile';
import { BuildingName } from '../../types/Building';
import { Alignment } from '../../types/Alignment';
import { SpellName } from '../../types/Spell';
import type { GameState } from '../../state/GameState';

export const calculateIncome = (gameState: GameState): number => {
  const turnOwner = getTurnOwner(gameState);
  const playerAlignment = turnOwner.playerProfile.alignment;
  // Pure-Magic player dont have any penalties from alignment only bonuses as they are masked their true alignments
  //  since they are able to cast any magic and looks families for all territory habits
  const isPureMagic = isPlayerDoctrine(gameState, Doctrine.PURE_MAGIC);

  return getRealmLands(gameState).reduce((acc, land) => {
    // https://github.com/j8kin/fantasy-empires-wars/wiki/Lands
    // https://github.com/j8kin/fantasy-empires-wars/wiki/Buildings#stronghold
    let landIncome = land.goldPerTurn;
    const landAlignment = getLandAlignment(land.type);

    switch (playerAlignment) {
      case Alignment.LAWFUL:
        if (landAlignment === Alignment.LAWFUL && !land.corrupted) {
          landIncome = landIncome * 1.4;
        }
        if (landAlignment === Alignment.CHAOTIC || land.corrupted) {
          landIncome = landIncome * 0.8;
        }
        break;
      case Alignment.CHAOTIC:
        if (!hasBuilding(land, BuildingName.STRONGHOLD)) {
          landIncome = landIncome * (isPureMagic ? 1.0 : 0.8);
        }
        if (landAlignment === Alignment.CHAOTIC || land.corrupted) {
          landIncome = landIncome * 1.9;
        }
        if (landAlignment === Alignment.LAWFUL && !land.corrupted) {
          landIncome = landIncome * (isPureMagic ? 1.4 : 0.5);
        }
        break;
      default:
        // Neutral players don't have neither benefits nor penalties from alignment
        break;
    }

    // add FERTILE LAND Bonus
    if (hasActiveEffect(land, SpellName.FERTILE_LAND, turnOwner.id)) {
      landIncome = landIncome * 1.5;
    }

    return Math.ceil(acc + landIncome);
  }, 0);
};
