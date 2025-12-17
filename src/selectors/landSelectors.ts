import { GameState } from '../state/GameState';
import { LandPosition } from '../state/map/land/LandPosition';
import { getLandId } from '../state/map/land/LandId';
import { LandState } from '../state/map/land/LandState';

import { getPlayer, hasTreasureByPlayer } from './playerSelectors';
import { getArmiesAtPosition } from './armySelectors';
import { NO_PLAYER } from '../domain/player/playerRepository';
import { getPlayerColorValue } from '../domain/ui/playerColors';
import { getRandomElement } from '../domain/utils/random';

import { TreasureType } from '../types/Treasures';
import { SpellName } from '../types/Spell';
import { LandType } from '../types/Land';
import { BuildingType } from '../types/Building';
import { Alignment } from '../types/Alignment';
import { Effect, EffectSourceId } from '../types/Effect';

export const getLand = (state: GameState, landPos: LandPosition) =>
  state.map.lands[getLandId(landPos)];

export const getLandOwner = (state: GameState, landPos: LandPosition): string =>
  state.players.find((p) => p.landsOwned.has(getLandId(landPos)))?.id ?? NO_PLAYER.id;

interface LandInfo {
  owner: string;
  color: string;
  type: LandType;
  alignment: Alignment;
  goldPerTurn: number;
  heroes: string[];
  regulars: string[];
  buildings: BuildingType[];
  effects: Effect[];
  isCorrupted: boolean;
  illusionMsg?: string;
}

export const getLandInfo = (state: GameState, landPos: LandPosition): LandInfo => {
  const land = getLand(state, landPos);
  const landOwner = getPlayer(state, getLandOwner(state, landPos));
  const landOwnerId = landOwner?.playerProfile.name ?? NO_PLAYER.id;
  const landOwnerColor = getPlayerColorValue(landOwner?.color ?? 'white');

  const isIllusion =
    hasTreasureByPlayer(landOwner, TreasureType.MIRROR_OF_ILLUSION) ||
    hasActiveEffect(land, SpellName.ILLUSION);

  const affectedByViewLand = hasActiveEffect(land, SpellName.VIEW_TERRITORY, state.turnOwner);

  if (landOwnerId !== NO_PLAYER.id && (landOwner.id === state.turnOwner || affectedByViewLand)) {
    if (isIllusion && landOwner.id !== state.turnOwner && affectedByViewLand) {
      return {
        owner: landOwnerId,
        color: landOwnerColor,
        type: land.land.id,
        alignment: land.corrupted ? Alignment.CHAOTIC : land.land.alignment,
        goldPerTurn: land.goldPerTurn,
        effects: [],
        heroes: [],
        regulars: [],
        buildings: [],
        isCorrupted: land.corrupted,
        illusionMsg: getRandomElement(ILLUSION_MESSAGES),
      };
    }

    // provide information about the land for owned territories and territories revealed by VIEW_TERRITORY Spell
    const armies = getArmiesAtPosition(state, landPos);
    return {
      owner: landOwnerId,
      color: landOwnerColor,
      type: land.land.id,
      alignment: land.corrupted ? Alignment.CHAOTIC : land.land.alignment,
      isCorrupted: land.corrupted,
      goldPerTurn: land.goldPerTurn,
      effects: [...land.effects],
      heroes: armies.flatMap((a) => a.heroes).map((h) => `${h.name} lvl: ${h.level}`),
      regulars: armies.flatMap((a) => a.regulars).map((r) => `${r.type} (${r.count})`),
      buildings: land.buildings.map((b) => b.id),
    };
  } else {
    return {
      owner: landOwnerId,
      color: landOwnerColor,
      type: land.land.id,
      alignment: land.corrupted ? Alignment.CHAOTIC : land.land.alignment,
      isCorrupted: land.corrupted,
      goldPerTurn: land.goldPerTurn,
      effects: [],
      heroes: [],
      regulars: [],
      // return buildings only for neutral lands if VIEW_TERRITORY spell is not affected on opponent
      buildings: landOwnerId === NO_PLAYER.id ? land.buildings.map((b) => b.id) : [],
    };
  }
};

const ILLUSION_MESSAGES: string[] = [
  'Gaze too long, and the mirror gazes back',
  'Look deeper, and the land begins reflects',
  'What you seek - fades, leave only reflection',
  'The truth recoils when watched too closely',
  'The land does not show what it is',
  'Your vision lingers—and something notices',
  'Sight finds no footing where mirrors rule',
  'The land reflects intent, not presence',
  'Focus breaks; the image stares back',
  'Here, sight is a question, not an answer',
];

export const hasActiveEffect = (
  state: LandState,
  effectSourceId: EffectSourceId,
  appliedBy?: string
): boolean => {
  return state.effects.some(
    (e) =>
      e.sourceId === effectSourceId &&
      e.duration > 0 &&
      (appliedBy === undefined || e.appliedBy === appliedBy)
  );
};
