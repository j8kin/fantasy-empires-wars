import { GameState } from '../../state/GameState';
import { LandPosition } from '../../state/map/land/LandPosition';
import {
  getPlayer,
  getTurnOwner,
  hasActiveEffectByPlayer,
  hasTreasureByPlayer,
} from '../../selectors/playerSelectors';
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
import { isHeroType, isWarMachine } from '../../domain/unit/unitTypeChecks';
import {
  calculateAndApplyArmyPenalties,
  PenaltyConfig,
} from '../../domain/army/armyPenaltyCalculator';

import { Spell, SpellName } from '../../types/Spell';
import { ManaType } from '../../types/Mana';
import { TreasureItem } from '../../types/Treasures';
import { HeroUnitType, MAX_HERO_LEVEL, RegularUnitType } from '../../types/UnitType';
import { destroyBuilding } from '../building/destroyBuilding';
import { getTilesInRadius } from '../utils/mapAlgorithms';
import { getMapDimensions } from '../../utils/screenPositionUtils';
import { calculateManaConversionAmount } from '../../utils/manaConversionUtils';
import { getAvailableToCastSpellLands } from './getAvailableToCastSpellLands';
import { getLandId } from '../../state/map/land/LandId';
import { LandType } from '../../types/Land';

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
  spellName: SpellName,
  mainAffectedLand?: LandPosition,
  secondaryAffectedLand?: LandPosition,
  exchangeMana?: ManaType
) => {
  // https://github.com/j8kin/fantasy-empires-wars/wiki/Magic

  // double-check that land is correctly selected to reuse this method in AI turn
  if (
    spellName === SpellName.EXCHANGE ||
    getAvailableToCastSpellLands(state, spellName).includes(getLandId(mainAffectedLand!))
  ) {
    const spell = getSpellById(spellName);

    castWhiteManaSpell(state, spell, mainAffectedLand!);
    castGreenManaSpell(state, spell, mainAffectedLand!);
    castBlueManaSpell(state, spell, mainAffectedLand, secondaryAffectedLand, exchangeMana);
    castRedManaSpell(state, spell, mainAffectedLand!);
    castBlackManaSpell(state, spell, mainAffectedLand!);
  }
};

const castWhiteManaSpell = (state: GameState, spell: Spell, landPos: LandPosition) => {
  switch (spell.id) {
    case SpellName.TURN_UNDEAD:
      const player = getPlayer(state, getLandOwner(state, landPos));
      // TURN_UNDEAD effect is active only once per player per turn
      if (hasActiveEffectByPlayer(player, SpellName.TURN_UNDEAD)) return;

      const maxClericLevel = getMaxHeroLevelByType(state, HeroUnitType.CLERIC);
      Object.assign(
        state,
        updatePlayerEffect(state, player.id, effectFactory(spell, state.turnOwner))
      );

      const penaltyConfig = calculatePenaltyConfig(spell.penalty!, maxClericLevel);

      killUnits(state, penaltyConfig, landPos!, [RegularUnitType.UNDEAD]);
      break;

    case SpellName.VIEW_TERRITORY:
      const land = getLand(state, landPos);
      land.effects.push(effectFactory(spell, state.turnOwner));
      break;

    case SpellName.BLESSING:
      getTilesInRadius(getMapDimensions(state), landPos, 1, false)
        .filter((l) => getLandOwner(state, l) === state.turnOwner)
        .map((p) => getLand(state, p))
        .forEach((l) => {
          l.effects.push(effectFactory(spell, state.turnOwner));
        });
      break;

    case SpellName.HEAL:
      // todo implement after Battle Resolve mechanics would be implemented [Issue #61]
      break;
    default:
      return; // skip other school spells
  }

  Object.assign(state, updatePlayerMana(state, state.turnOwner, spell.manaType, -spell.manaCost));
};

const castGreenManaSpell = (state: GameState, spell: Spell, landPos: LandPosition): void => {
  let maxDruidLevel: number = 0;
  switch (spell.id) {
    case SpellName.FERTILE_LAND:
      maxDruidLevel = getMaxHeroLevelByType(state, HeroUnitType.DRUID);
      applyEffectOnRandomLands(state, spell, landPos!, maxDruidLevel);
      break;

    case SpellName.ENTANGLING_ROOTS:
      getLand(state, landPos).effects.push(effectFactory(spell, state.turnOwner));
      break;

    case SpellName.BEAST_ATTACK:
      maxDruidLevel = getMaxHeroLevelByType(state, HeroUnitType.DRUID);
      // penalty increased based on max hero level
      const penaltyConfig = calculatePenaltyConfig(spell.penalty!, maxDruidLevel);

      killUnits(state, penaltyConfig, landPos!);
      break;

    case SpellName.EARTHQUAKE:
      // kill units
      killUnits(state, spell.penalty!, landPos!);
      // try to destroy building if exists (40% probability)
      if (Math.random() < 0.4) {
        destroyBuilding(state, landPos!);
      }
      break;

    default:
      return; // skip other school spells
  }

  const turnOwner = getTurnOwner(state);
  const hasVerdantIdol = hasTreasureByPlayer(turnOwner, TreasureItem.VERDANT_IDOL);

  Object.assign(
    state,
    updatePlayerMana(
      state,
      state.turnOwner,
      spell.manaType,
      -Math.floor(spell.manaCost * (spell.manaType === ManaType.GREEN && hasVerdantIdol ? 0.85 : 1))
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
  switch (spell.id) {
    case SpellName.ILLUSION:
      const maxEnchanterLevel = getMaxHeroLevelByType(state, HeroUnitType.ENCHANTER);
      applyEffectOnRandomLands(state, spell, landPos!, maxEnchanterLevel);
      break;

    case SpellName.TELEPORT:
      // fallback should never happen
      if (secondLand != null && getLandOwner(state, secondLand) === state.turnOwner) {
        const armiesToTeleport = getArmiesAtPositionByPlayers(state, landPos!, [state.turnOwner]);
        armiesToTeleport.forEach((army) => {
          army.movement = movementFactory(secondLand);
        });
      }
      break;

    case SpellName.TORNADO:
      killUnits(state, spell.penalty!, landPos!);
      break;

    case SpellName.EXCHANGE:
      const turnOwner = getTurnOwner(state);
      const addMana = calculateManaConversionAmount(
        turnOwner.playerProfile.alignment,
        exchangeMana!
      );

      Object.assign(state, updatePlayerMana(state, state.turnOwner, exchangeMana!, addMana));
      break;

    default:
      return; // skip other school spells
  }

  Object.assign(state, updatePlayerMana(state, state.turnOwner, spell.manaType, -spell.manaCost));
};

const castRedManaSpell = (state: GameState, spell: Spell, landPos: LandPosition) => {
  switch (spell.id) {
    case SpellName.EMBER_RAID:
      const land = getLand(state, landPos);

      land.effects.push(effectFactory(spell, state.turnOwner));
      land.buildings.forEach((b) => b.slots?.forEach((s) => (s.turnsRemaining += 1)));
      break;

    case SpellName.FORGE_OF_WAR:
      const forgedUnitType =
        getLand(state, landPos).land.unitsToRecruit.find(
          (u) =>
            !isHeroType(u) &&
            !isWarMachine(u) &&
            u !== RegularUnitType.WARD_HANDS &&
            u !== RegularUnitType.WARRIOR // to recruit uniq type then WARRIOR
        ) ?? RegularUnitType.WARRIOR; // fallback to WARRIOR if no uniq type of units available to recruit

      const newArmy = armyFactory(state.turnOwner, landPos, undefined, [
        regularsFactory(forgedUnitType as RegularUnitType, 60), // the same as 3 slots in Barracks
      ]);
      Object.assign(state, addArmyToGameState(state, newArmy));
      break;

    case SpellName.FIRESTORM:
      const maxPyromancerLevel = getMaxHeroLevelByType(state, HeroUnitType.PYROMANCER);
      const penaltyConfig = calculatePenaltyConfig(spell.penalty!, maxPyromancerLevel);

      getTilesInRadius(getMapDimensions(state), landPos, 1, false).forEach((l) => {
        killUnits(state, penaltyConfig, l);
      });
      break;

    case SpellName.METEOR_SHOWER:
      const maxMageLvl = getMaxHeroLevelByType(state, HeroUnitType.PYROMANCER);
      const showerPenaltyCfg = calculatePenaltyConfig(spell.penalty!, maxMageLvl);

      killUnits(state, showerPenaltyCfg, landPos!);
      // try to destroy building if exists (50-60% probability)
      if (Math.random() < 0.5 + (0.1 * maxMageLvl) / MAX_HERO_LEVEL) {
        destroyBuilding(state, landPos!);
      }
      break;

    default:
      return; // skip other school spells
  }

  Object.assign(state, updatePlayerMana(state, state.turnOwner, spell.manaType, -spell.manaCost));
};

const castBlackManaSpell = (state: GameState, spell: Spell, landPos: LandPosition) => {
  switch (spell.id) {
    case SpellName.SUMMON_UNDEAD:
      const maxNecromancerLevel = getMaxHeroLevelByType(state, HeroUnitType.NECROMANCER);
      const undeadSummoned = regularsFactory(
        RegularUnitType.UNDEAD,
        Math.ceil(getRandomInt(40, 60) * (1 + maxNecromancerLevel / MAX_HERO_LEVEL))
      );
      const stationaryArmy = getArmiesAtPosition(state, landPos).find(
        (a) => !isMoving(a) && a.controlledBy === state.turnOwner
      );
      if (stationaryArmy != null) {
        Object.assign(
          state,
          updateArmyInGameState(state, addRegulars(stationaryArmy, undeadSummoned))
        );
      } else {
        Object.assign(
          state,
          addArmyToGameState(
            state,
            armyFactory(state.turnOwner, landPos, undefined, [undeadSummoned])
          )
        );
      }
      break;

    case SpellName.PLAGUE:
      killUnits(state, spell.penalty!, landPos!);
      break;

    case SpellName.CORRUPTION:
      const land = getLand(state, landPos);
      land.corrupted = true;
      if (getLandOwner(state, landPos) === state.turnOwner) {
        land.goldPerTurn = land.land.goldPerTurn.max;
      } else {
        land.goldPerTurn = land.land.goldPerTurn.min;
      }
      // change units to recruit
      if (land.land.id === LandType.GREEN_FOREST) {
        land.land.unitsToRecruit = [
          RegularUnitType.ORC,
          RegularUnitType.DARK_ELF,
          RegularUnitType.BALLISTA,
          RegularUnitType.CATAPULT,
          HeroUnitType.SHADOW_BLADE,
        ];
      } else {
        land.land.unitsToRecruit = [
          RegularUnitType.ORC,
          RegularUnitType.BALLISTA,
          RegularUnitType.CATAPULT,
          HeroUnitType.OGR,
        ];
      }
      break;

    case SpellName.RAISE_DEAD_HERO:
      // todo implement after Battle Resolve mechanics would be implemented [Issue #61]
      break;
    default:
      return; // skip other school spells
  }

  Object.assign(state, updatePlayerMana(state, state.turnOwner, spell.manaType, -spell.manaCost));
};

const applyEffectOnRandomLands = (
  state: GameState,
  spell: Spell,
  landPos: LandPosition,
  msxMageLvl: number
) => {
  const affectedLands = getTilesInRadius(getMapDimensions(state), landPos, 1, true)
    .filter((l) => getLandOwner(state, l) === state.turnOwner)
    .flatMap((l) => getLand(state, l));

  const nLandsToGrow = Math.ceil(affectedLands.length * (msxMageLvl / MAX_HERO_LEVEL));

  const selectedLands = getMultipleRandomElements(affectedLands, nLandsToGrow);

  [getLand(state, landPos!), ...selectedLands].forEach((l) =>
    l.effects.push(effectFactory(spell, state.turnOwner))
  );
};

const killUnits = (
  state: GameState,
  penaltyConfig: PenaltyConfig,
  landPos: LandPosition,
  units?: RegularUnitType[]
) => {
  // right now spell affects all players, even turnOwner in rare cases it could cause a friendly-fire
  state.players.forEach((p) => {
    const playerArmiesAtPosition = getArmiesAtPositionByPlayers(state, landPos, [p.id]);

    const updatedArmies = calculateAndApplyArmyPenalties(
      playerArmiesAtPosition,
      penaltyConfig,
      units
    );

    updatedArmies.forEach((army) => {
      Object.assign(state, updateArmyInGameState(state, army));
    });
  });

  // cleanup Armies
  Object.assign(state, cleanupArmies(state));
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
