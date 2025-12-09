import { GameState } from '../../state/GameState';
import { LandPosition } from '../../state/map/land/LandPosition';
import { getPlayer, getTurnOwner, hasActiveEffectByPlayer } from '../../selectors/playerSelectors';
import {
  getArmiesAtPosition,
  getArmiesAtPositionByPlayers,
  getMaxHeroLevelByType,
  isMoving,
} from '../../selectors/armySelectors';
import { getLand, getLandOwner } from '../../selectors/landSelectors';
import { getSpellById } from '../../selectors/spellSelectors';
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
import { movementFactory } from '../../factories/movementFactory';

import { getMultipleRandomElements, getRandomInt } from '../../domain/utils/random';
import {
  calculateAndApplyArmyPenalties,
  PenaltyConfig,
} from '../../domain/army/armyPenaltyCalculator';

import { Spell, SpellName } from '../../types/Spell';
import { TreasureItem } from '../../types/Treasures';
import { ManaType } from '../../types/Mana';
import { HeroUnitType, MAX_HERO_LEVEL, RegularUnitType } from '../../types/UnitType';
import { getTilesInRadius } from '../utils/mapAlgorithms';
import { getMapDimensions } from '../../utils/screenPositionUtils';
import { calculateManaConversionAmount } from '../../utils/manaConversionUtils';

/**
 * Implement cast spell logic for each spell type.
 * @param gameState
 * @param spellName
 * @param mainAffectedLand affected land, could be null if spell doesn't affect land (Arcane Exchange, for example)
 * @param secondaryAffectedLand secondary affected land used by Teleport
 * @param exchangeMana - used by Arcane Exchange
 */
export const castSpell = (
  gameState: GameState,
  spellName: SpellName,
  mainAffectedLand?: LandPosition,
  secondaryAffectedLand?: LandPosition,
  exchangeMana?: ManaType
) => {
  const turnOwner = getTurnOwner(gameState);
  const spell = getSpellById(spellName);
  // first get treasures that have effect on spell casting
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

  // todo implement spell casting logic
  // https://github.com/j8kin/fantasy-empires-wars/wiki/Magic
  castWhiteManaSpell(gameState, spell, mainAffectedLand!);
  castGreenManaSpell(gameState, spell, mainAffectedLand!);
  castBlueManaSpell(gameState, spell, mainAffectedLand, secondaryAffectedLand, exchangeMana);
  castBlackManaSpell(gameState, spell, mainAffectedLand!);
};

const castWhiteManaSpell = (gameState: GameState, spell: Spell, landPos: LandPosition) => {
  switch (spell.id) {
    case SpellName.TURN_UNDEAD:
      const maxClericLevel = getMaxHeroLevelByType(gameState, HeroUnitType.CLERIC);
      const player = getPlayer(gameState, getLandOwner(gameState, landPos));
      // TURN_UNDEAD effect is active only once per player per turn
      if (!hasActiveEffectByPlayer(player, SpellName.TURN_UNDEAD)) {
        updatePlayerEffect(gameState, player.id, effectFactory(spell, gameState.turnOwner));

        // Note: mana for the spell is already deducted in castSpell() above.

        // Clone penalty config to avoid mutating the global Spell definition across tests/casts
        const undeadPenaltyConfig = calculatePenaltyConfig(spell.penalty!, maxClericLevel);

        gameState.players.forEach((p) => {
          const playerArmiesAtPosition = getArmiesAtPositionByPlayers(gameState, landPos, [p.id]);

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
      getTilesInRadius(getMapDimensions(gameState), landPos, 1, false)
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

const castGreenManaSpell = (gameState: GameState, spell: Spell, landPos: LandPosition): void => {};

const castBlueManaSpell = (
  gameState: GameState,
  spell: Spell,
  landPos?: LandPosition,
  secondLand?: LandPosition,
  exchangeMana?: ManaType
) => {
  switch (spell.id) {
    case SpellName.ILLUSION:
      const maxEnchanterLevel = getMaxHeroLevelByType(gameState, HeroUnitType.ENCHANTER);
      const landsToHide = getTilesInRadius(getMapDimensions(gameState), landPos!, 1, true)
        .filter((l) => getLandOwner(gameState, l) === gameState.turnOwner)
        .flatMap((l) => getLand(gameState, l));
      const nLandToHide = Math.ceil(landsToHide.length * (maxEnchanterLevel / MAX_HERO_LEVEL));

      // add ILLUSION effect to lands
      const selectedLands = getMultipleRandomElements(landsToHide, nLandToHide);
      [getLand(gameState, landPos!), ...selectedLands].forEach((l) =>
        l.effects.push(effectFactory(spell, gameState.turnOwner))
      );
      break;
    case SpellName.TELEPORT:
      // fallback should never happen
      if (secondLand != null && getLandOwner(gameState, secondLand) === gameState.turnOwner) {
        const armiesToTeleport = getArmiesAtPositionByPlayers(gameState, landPos!, [
          gameState.turnOwner,
        ]);
        armiesToTeleport.forEach((army) => {
          army.movement = movementFactory(secondLand);
        });
      }
      break;

    case SpellName.TORNADO:
      const penalty = spell.penalty!;

      gameState.players.forEach((p) => {
        const playerArmiesAtPosition = getArmiesAtPositionByPlayers(gameState, landPos!, [p.id]);

        const updatedArmies = calculateAndApplyArmyPenalties(playerArmiesAtPosition, penalty);

        updatedArmies.forEach((army) => {
          Object.assign(gameState, updateArmyInGameState(gameState, army));
        });
      });

      // cleanup Armies
      cleanupArmies(gameState);
      break;

    case SpellName.EXCHANGE:
      const turnOwner = getTurnOwner(gameState);
      const addMana = calculateManaConversionAmount(
        turnOwner.playerProfile.alignment,
        exchangeMana!
      );

      Object.assign(
        gameState,
        updatePlayerMana(gameState, gameState.turnOwner, exchangeMana!, addMana)
      );
      break;

    default:
      return;
  }
};

const castBlackManaSpell = (gameState: GameState, spell: Spell, landPos: LandPosition) => {
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

const calculatePenaltyConfig = (basePenalty: PenaltyConfig, maxLevel: number) => {
  const penaltyConfig: PenaltyConfig = {
    regular: { ...basePenalty.regular },
    veteran: { ...basePenalty.veteran },
    elite: { ...basePenalty.elite },
  };

  penaltyConfig.regular.maxPct += 0.1 * (maxLevel / MAX_HERO_LEVEL);
  penaltyConfig.regular.minPct += 0.1 * (maxLevel / MAX_HERO_LEVEL);
  penaltyConfig.regular.minAbs *= 1 + maxLevel / MAX_HERO_LEVEL;
  penaltyConfig.regular.maxAbs *= 1 + maxLevel / MAX_HERO_LEVEL;

  penaltyConfig.veteran.maxPct += 0.1 * (maxLevel / MAX_HERO_LEVEL);
  penaltyConfig.veteran.minPct += 0.1 * (maxLevel / MAX_HERO_LEVEL);
  penaltyConfig.veteran.minAbs *= 1 + maxLevel / MAX_HERO_LEVEL;
  penaltyConfig.veteran.maxAbs *= 1 + maxLevel / MAX_HERO_LEVEL;

  penaltyConfig.elite.maxPct += 0.1 * (maxLevel / MAX_HERO_LEVEL);
  penaltyConfig.elite.minPct += 0.1 * (maxLevel / MAX_HERO_LEVEL);
  penaltyConfig.elite.minAbs *= 1 + maxLevel / MAX_HERO_LEVEL;
  penaltyConfig.elite.maxAbs *= 1 + maxLevel / MAX_HERO_LEVEL;

  return penaltyConfig;
};
