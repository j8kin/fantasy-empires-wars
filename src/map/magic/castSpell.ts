import { not } from '../../utils/hooks';
import { getLandId } from '../../state/map/land/LandId';
import { getPlayer, getTurnOwner, hasActiveEffectByPlayer, hasTreasureByPlayer } from '../../selectors/playerSelectors';
import {
  getArmiesAtPosition,
  getArmiesAtPositionByPlayers,
  getMaxHeroLevelByType,
  isMoving,
} from '../../selectors/armySelectors';
import { getLand, getLandOwner, getTilesInRadius, hasActiveEffect } from '../../selectors/landSelectors';
import { getSpellById } from '../../selectors/spellSelectors';
import {
  removeLandEffect,
  updateLand,
  updateLandBuildingSlots,
  updateLandEffect,
  updatePlayerEffect,
  updatePlayerMana,
} from '../../systems/gameStateActions';
import { addArmyToGameState, addRegulars, updateArmyInGameState } from '../../systems/armyActions';
import { applyArmyCasualtiesAtPosition } from './applyArmyCasualties';
import { effectFactory } from '../../factories/effectFactory';
import { regularsFactory } from '../../factories/regularsFactory';
import { armyFactory } from '../../factories/armyFactory';
import { movementFactory } from '../../factories/movementFactory';
import { getMultipleRandomElements, getRandomInt } from '../../domain/utils/random';
import { isDrivenType, isRegularUnit } from '../../domain/unit/unitTypeChecks';
import { destroyBuilding } from '../building/destroyBuilding';
import { getMapDimensions } from '../../utils/screenPositionUtils';
import { calculateManaConversionAmount } from '../../utils/manaConversionUtils';
import { getValidMagicLands } from './getValidMagicLands';
import { getLandGoldPerTurn, getLandUnitsToRecruit } from '../../domain/land/landRepository';
import { SpellName } from '../../types/Spell';
import { Mana } from '../../types/Mana';
import { TreasureName } from '../../types/Treasures';
import { EffectKind } from '../../types/Effect';
import { HeroUnitName, MAX_HERO_LEVEL, RegularUnitName } from '../../types/UnitType';
import type { GameState } from '../../state/GameState';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { Spell, SpellType } from '../../types/Spell';
import type { ManaType } from '../../types/Mana';
import type { RegularUnitType } from '../../types/UnitType';
import type { PenaltyConfig } from '../../domain/army/armyPenaltyCalculator';

/**
 * Implement cast spell logic for each spell type.
 * @param state
 * @param spellName
 * @param mainAffectedLand affected land, could be null if spell doesn't affect land (Arcane Exchange, for example)
 * @param secondaryAffectedLand secondary affected land used by Teleport
 * @param exchangeMana - used by Arcane Exchange
 */
export const castSpell = (
  state: GameState,
  spellName: SpellType,
  mainAffectedLand?: LandPosition,
  secondaryAffectedLand?: LandPosition,
  exchangeMana?: ManaType
) => {
  // https://github.com/j8kin/fantasy-empires-wars/wiki/Magic

  // double-check that land is correctly selected to reuse this method in AI turn
  if (spellName === SpellName.EXCHANGE || getValidMagicLands(state, spellName).includes(getLandId(mainAffectedLand!))) {
    const spell = getSpellById(spellName);

    const isLandUnderProtection =
      mainAffectedLand != null ? hasActiveEffect(getLand(state, mainAffectedLand), TreasureName.AEGIS_SHARD) : false;

    if (spell.rules?.type === EffectKind.NEGATIVE && isLandUnderProtection) {
      // a negative spell should be canceled when land under protection
      const effectId = getLand(state, mainAffectedLand!).effects.find(
        (e) => e.sourceId === TreasureName.AEGIS_SHARD
      )!.id;
      let updatedState = updatePlayerMana(state, state.turnOwner, spell.manaType, -spell.manaCost);
      updatedState = removeLandEffect(updatedState, mainAffectedLand!, effectId);
      Object.assign(state, updatedState);
    } else {
      castWhiteManaSpell(state, spell, mainAffectedLand!);
      castGreenManaSpell(state, spell, mainAffectedLand!);
      castBlueManaSpell(state, spell, mainAffectedLand, secondaryAffectedLand, exchangeMana);
      castRedManaSpell(state, spell, mainAffectedLand!);
      castBlackManaSpell(state, spell, mainAffectedLand!);
    }
  }
};

const castWhiteManaSpell = (state: GameState, spell: Spell, landPos: LandPosition) => {
  let updatedState: GameState = state;
  switch (spell.type) {
    case SpellName.TURN_UNDEAD:
      const player = getPlayer(updatedState, getLandOwner(state, landPos));
      // TURN_UNDEAD effect is active only once per player per turn
      if (hasActiveEffectByPlayer(player, SpellName.TURN_UNDEAD)) return;

      const maxClericLevel = getMaxHeroLevelByType(state, HeroUnitName.CLERIC);
      updatedState = updatePlayerEffect(updatedState, player.id, effectFactory(spell.type, state.turnOwner));

      const penaltyConfig = calculatePenaltyConfig(spell.penalty!, maxClericLevel);

      updatedState = applyArmyCasualtiesAtPosition(updatedState, penaltyConfig, landPos!, [RegularUnitName.UNDEAD]);
      break;

    case SpellName.VIEW_TERRITORY:
      updatedState = updateLandEffect(updatedState, landPos, effectFactory(spell.type, state.turnOwner));
      break;

    case SpellName.BLESSING:
      getTilesInRadius(getMapDimensions(updatedState), landPos, 1, false)
        .filter((l) => getLandOwner(updatedState, l) === updatedState.turnOwner)
        .forEach((l) => {
          updatedState = updateLandEffect(updatedState, l, effectFactory(spell.type, updatedState.turnOwner));
        });
      break;

    case SpellName.HEAL:
      // todo implement after Battle Resolve mechanics would be implemented [Issue #61]
      break;
    default:
      return; // skip other school spells
  }

  Object.assign(state, updatePlayerMana(updatedState, updatedState.turnOwner, spell.manaType, -spell.manaCost));
};

const castGreenManaSpell = (state: GameState, spell: Spell, landPos: LandPosition): void => {
  let updatedState: GameState = state;
  let maxDruidLevel: number = 0;
  switch (spell.type) {
    case SpellName.FERTILE_LAND:
      maxDruidLevel = getMaxHeroLevelByType(updatedState, HeroUnitName.DRUID);
      updatedState = applyEffectOnRandomLands(updatedState, spell, landPos!, maxDruidLevel);
      break;

    case SpellName.ENTANGLING_ROOTS:
      updatedState = updateLandEffect(updatedState, landPos, effectFactory(spell.type, updatedState.turnOwner));
      break;

    case SpellName.BEAST_ATTACK:
      maxDruidLevel = getMaxHeroLevelByType(updatedState, HeroUnitName.DRUID);
      // penalty increased based on max hero level
      const penaltyConfig = calculatePenaltyConfig(spell.penalty!, maxDruidLevel);

      updatedState = applyArmyCasualtiesAtPosition(updatedState, penaltyConfig, landPos!);
      break;

    case SpellName.EARTHQUAKE:
      // kill units
      updatedState = applyArmyCasualtiesAtPosition(updatedState, spell.penalty!, landPos!);
      // try to destroy building if exists (40% probability)
      if (Math.random() < 0.4) {
        updatedState = destroyBuilding(updatedState, landPos!);
      }
      break;

    default:
      return; // skip other school spells
  }

  const hasVerdantIdol = hasTreasureByPlayer(getTurnOwner(updatedState), TreasureName.VERDANT_IDOL);

  Object.assign(
    state,
    updatePlayerMana(
      updatedState,
      updatedState.turnOwner,
      spell.manaType,
      -Math.floor(spell.manaCost * (spell.manaType === Mana.GREEN && hasVerdantIdol ? 0.85 : 1))
    )
  );
};

const castBlueManaSpell = (
  state: GameState,
  spell: Spell,
  landPos?: LandPosition,
  secondLand?: LandPosition,
  exchangeMana?: ManaType
) => {
  let updatedState: GameState = state;
  switch (spell.type) {
    case SpellName.ILLUSION:
      const maxEnchanterLevel = getMaxHeroLevelByType(updatedState, HeroUnitName.ENCHANTER);
      updatedState = applyEffectOnRandomLands(updatedState, spell, landPos!, maxEnchanterLevel);
      break;

    case SpellName.TELEPORT:
      // fallback should never happen
      if (secondLand != null && getLandOwner(updatedState, secondLand) === updatedState.turnOwner) {
        const armiesToTeleport = getArmiesAtPositionByPlayers(updatedState, landPos!, [updatedState.turnOwner]);
        armiesToTeleport.forEach((army) => {
          updatedState = updateArmyInGameState(updatedState, {
            ...army,
            movement: movementFactory(secondLand),
          });
        });
      }
      break;

    case SpellName.TORNADO:
      updatedState = applyArmyCasualtiesAtPosition(updatedState, spell.penalty!, landPos!);
      break;

    case SpellName.EXCHANGE:
      const turnOwner = getTurnOwner(updatedState);
      const addMana = calculateManaConversionAmount(turnOwner.playerProfile.alignment, exchangeMana!);

      updatedState = updatePlayerMana(updatedState, updatedState.turnOwner, exchangeMana!, addMana);
      break;

    default:
      return; // skip other school spells
  }

  Object.assign(state, updatePlayerMana(updatedState, updatedState.turnOwner, spell.manaType, -spell.manaCost));
};

const castRedManaSpell = (state: GameState, spell: Spell, landPos: LandPosition) => {
  let updatedState: GameState = state;
  switch (spell.type) {
    case SpellName.EMBER_RAID:
      updatedState = updateLandEffect(updatedState, landPos, effectFactory(spell.type, updatedState.turnOwner));
      // Delay all recruitment by incrementing turnsRemaining by 1
      updatedState = updateLandBuildingSlots(updatedState, landPos, (slots) =>
        slots.map((slot) => ({
          ...slot,
          turnsRemaining: slot.turnsRemaining + 1,
        }))
      );
      break;

    case SpellName.FORGE_OF_WAR:
      const land = getLand(updatedState, landPos);
      const forgedUnitType: RegularUnitType =
        getLandUnitsToRecruit(land.type, land.corrupted)
          .filter(isRegularUnit)
          .filter(not(isDrivenType))
          .find(
            (u) => u !== RegularUnitName.WARD_HANDS && u !== RegularUnitName.WARRIOR // to recruit uniq type then WARRIOR
          ) ?? RegularUnitName.WARRIOR; // fallback to WARRIOR if no uniq type of units available to recruit

      const newArmy = armyFactory(updatedState.turnOwner, landPos, {
        // the same as 3 slots in Barracks
        regular: regularsFactory(forgedUnitType, 60),
      });
      updatedState = addArmyToGameState(updatedState, newArmy);
      break;

    case SpellName.FIRESTORM:
      const maxPyromancerLevel = getMaxHeroLevelByType(updatedState, HeroUnitName.PYROMANCER);
      const penaltyConfig = calculatePenaltyConfig(spell.penalty!, maxPyromancerLevel);

      getTilesInRadius(getMapDimensions(updatedState), landPos, 1, false).forEach((l) => {
        updatedState = applyArmyCasualtiesAtPosition(updatedState, penaltyConfig, l);
      });
      break;

    case SpellName.METEOR_SHOWER:
      const maxMageLvl = getMaxHeroLevelByType(updatedState, HeroUnitName.PYROMANCER);
      const showerPenaltyCfg = calculatePenaltyConfig(spell.penalty!, maxMageLvl);

      updatedState = applyArmyCasualtiesAtPosition(updatedState, showerPenaltyCfg, landPos!);
      // try to destroy building if exists (50-60% probability)
      if (Math.random() < 0.5 + (0.1 * maxMageLvl) / MAX_HERO_LEVEL) {
        updatedState = destroyBuilding(updatedState, landPos!);
      }
      break;

    default:
      return; // skip other school spells
  }

  Object.assign(state, updatePlayerMana(updatedState, updatedState.turnOwner, spell.manaType, -spell.manaCost));
};

const castBlackManaSpell = (state: GameState, spell: Spell, landPos: LandPosition) => {
  let updatedState: GameState = state;
  switch (spell.type) {
    case SpellName.SUMMON_UNDEAD:
      const maxNecromancerLevel = getMaxHeroLevelByType(updatedState, HeroUnitName.NECROMANCER);
      const undeadSummoned = regularsFactory(
        RegularUnitName.UNDEAD,
        Math.ceil(getRandomInt(40, 60) * (1 + maxNecromancerLevel / MAX_HERO_LEVEL))
      );
      const stationaryArmy = getArmiesAtPosition(updatedState, landPos).find(
        (a) => !isMoving(a) && a.controlledBy === updatedState.turnOwner
      );
      if (stationaryArmy != null) {
        updatedState = updateArmyInGameState(updatedState, addRegulars(stationaryArmy, undeadSummoned));
      } else {
        updatedState = addArmyToGameState(
          updatedState,
          armyFactory(updatedState.turnOwner, landPos, { regular: undeadSummoned })
        );
      }
      break;

    case SpellName.PLAGUE:
      updatedState = applyArmyCasualtiesAtPosition(updatedState, spell.penalty!, landPos!);
      break;

    case SpellName.CORRUPTION:
      const land = getLand(updatedState, landPos);
      const isOwnedByTurnOwner = getLandOwner(updatedState, landPos) === updatedState.turnOwner;
      const landGoldPerTurn = getLandGoldPerTurn(land.type);
      const goldPerTurn = isOwnedByTurnOwner ? landGoldPerTurn.max : landGoldPerTurn.min;

      updatedState = updateLand(updatedState, landPos, {
        corrupted: true,
        goldPerTurn,
      });
      break;

    case SpellName.RAISE_DEAD_HERO:
      // todo implement after Battle Resolve mechanics would be implemented [Issue #61]
      break;
    default:
      return; // skip other school spells
  }

  Object.assign(state, updatePlayerMana(updatedState, updatedState.turnOwner, spell.manaType, -spell.manaCost));
};

const applyEffectOnRandomLands = (
  state: GameState,
  spell: Spell,
  landPos: LandPosition,
  msxMageLvl: number
): GameState => {
  const affectedLandPositions = getTilesInRadius(getMapDimensions(state), landPos, 1, true).filter(
    (l) => getLandOwner(state, l) === state.turnOwner
  );

  const nLandsToGrow = Math.ceil(affectedLandPositions.length * (msxMageLvl / MAX_HERO_LEVEL));

  const selectedLandPositions = getMultipleRandomElements(affectedLandPositions, nLandsToGrow);

  let updatedState = state;
  [landPos, ...selectedLandPositions].forEach((l) => {
    updatedState = updateLandEffect(updatedState, l, effectFactory(spell.type, state.turnOwner));
  });

  return updatedState;
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
