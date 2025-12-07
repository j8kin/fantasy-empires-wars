import { GameState } from '../../state/GameState';
import { LandPosition } from '../../state/map/land/LandPosition';
import { getLandId } from '../../state/map/land/LandId';
import { getPlayer, getTurnOwner, hasActiveEffectByPlayer } from '../../selectors/playerSelectors';
import {
  getArmiesAtPosition,
  getMaxHeroLevelByType,
  isMoving,
} from '../../selectors/armySelectors';
import { getLand, getLandOwner } from '../../selectors/landSelectors';
import { updatePlayerEffect, updatePlayerMana } from '../../systems/gameStateActions';
import {
  addArmyToGameState,
  addRegulars,
  cleanupArmies,
  updateArmyInGameState,
} from '../../systems/armyActions';
import { effectFactory } from '../../factories/effectFactory';
import { regularsFactory } from '../../factories/regularsFactory';
import { armyFactory } from '../../factories/armyFactory';

import { getRandomInt } from '../../domain/utils/random';
import {
  calculateAndApplyArmyPenalties,
  PenaltyConfig,
} from '../../domain/army/armyPenaltyCalculator';

import { Spell, SpellName } from '../../types/Spell';
import { TreasureItem } from '../../types/Treasures';
import { ManaType } from '../../types/Mana';
import { HeroUnitType, MAX_HERO_LEVEL, RegularUnitType } from '../../types/UnitType';
import { getTilesInRadius } from '../utils/mapAlgorithms';

export const castSpell = (spell: Spell, affectedLand: LandPosition, gameState: GameState) => {
  const turnOwner = getTurnOwner(gameState);
  // first get treasures that have affect on spell casting
  // https://github.com/j8kin/fantasy-empires-wars/wiki/Heroes’-Quests
  const hasVerdantIdol = turnOwner.empireTreasures?.some((t) => t.id === TreasureItem.VERDANT_IDOL);

  if (spell.manaType === ManaType.GREEN && hasVerdantIdol) {
    Object.assign(
      gameState,
      updatePlayerMana(gameState, turnOwner.id, spell.manaType, -spell.manaCost * 0.85)
    );
  } else {
    Object.assign(
      gameState,
      updatePlayerMana(gameState, turnOwner.id, spell.manaType, -spell.manaCost)
    );
  }
  const landId = getLandId(affectedLand);
  console.log(`Casting ${spell.id} on ${landId}`); // todo remove debug log

  // todo implement spell casting logic
  // https://github.com/j8kin/fantasy-empires-wars/wiki/Magic
  castWhiteManaSpell(gameState, affectedLand, spell);
  castBlackManaSpell(gameState, affectedLand, spell);
};

const castWhiteManaSpell = (gameState: GameState, landPos: LandPosition, spell: Spell) => {
  switch (spell.id) {
    case SpellName.TURN_UNDEAD:
      const maxClericLevel = getMaxHeroLevelByType(gameState, HeroUnitType.CLERIC);
      const player = getPlayer(gameState, getLandOwner(gameState, landPos));
      // TURN_UNDEAD effect is active only once per player per turn
      if (!hasActiveEffectByPlayer(player, SpellName.TURN_UNDEAD)) {
        updatePlayerEffect(gameState, player.id, effectFactory(spell, gameState.turnOwner));

        Object.assign(
          gameState,
          updatePlayerMana(gameState, gameState.turnOwner, ManaType.WHITE, -spell.manaCost)
        );

        const undeadPenaltyConfig: PenaltyConfig = {
          regular: {
            minPct: 0,
            maxPct: 0,
            minAbs: 40 * (1 + maxClericLevel / MAX_HERO_LEVEL),
            maxAbs: 60 * (1 + maxClericLevel / MAX_HERO_LEVEL),
          },
          // there are no veteran and elite UNDEAD units in the game, so penalty config is empty
          veteran: { minPct: 0, maxPct: 0, maxAbs: 0, minAbs: 0 },
          elite: { minPct: 0, maxPct: 0, maxAbs: 0, minAbs: 0 },
        };

        gameState.players.forEach((p) => {
          const playerArmiesAtPosition = getArmiesAtPosition(gameState, landPos).filter(
            (a) => a.controlledBy === p.id
          );

          const updatedArmies = calculateAndApplyArmyPenalties(
            playerArmiesAtPosition,
            undeadPenaltyConfig,
            [RegularUnitType.UNDEAD]
          );

          updatedArmies.forEach((army) => {
            Object.assign(gameState, updateArmyInGameState(gameState, army));
          });
        });

        // cleanup Armies
        cleanupArmies(gameState);
      }
      break;

    case SpellName.VIEW_TERRITORY:
      const land = getLand(gameState, landPos);
      land.effects.push(effectFactory(spell, gameState.turnOwner));
      break;

    case SpellName.BLESSING:
      getTilesInRadius(gameState.map.dimensions, landPos, 1, false)
        .filter((l) => getLandOwner(gameState, l) === gameState.turnOwner)
        .map((p) => getLand(gameState, p))
        .forEach((l) => {
          l.effects.push(effectFactory(spell, gameState.turnOwner));
        });
      break;
    default:
      return;
  }
};

const castBlackManaSpell = (gameState: GameState, landPos: LandPosition, spell: Spell) => {
  switch (spell.id) {
    case SpellName.SUMMON_UNDEAD:
      const maxNecromancerLevel = getMaxHeroLevelByType(gameState, HeroUnitType.NECROMANCER);
      const undeadSummoned = regularsFactory(
        RegularUnitType.UNDEAD,
        Math.ceil(getRandomInt(40, 60) * (1 + maxNecromancerLevel / MAX_HERO_LEVEL))
      );
      const stationaryArmy = getArmiesAtPosition(gameState, landPos).find(
        (a) => !isMoving(a) && a.controlledBy === gameState.turnOwner
      );
      if (stationaryArmy != null) {
        Object.assign(
          gameState,
          updateArmyInGameState(gameState, addRegulars(stationaryArmy, undeadSummoned))
        );
      } else {
        Object.assign(
          gameState,
          addArmyToGameState(
            gameState,
            armyFactory(gameState.turnOwner, landPos, undefined, [undeadSummoned])
          )
        );
      }
      break;
    default:
      return;
  }
};
