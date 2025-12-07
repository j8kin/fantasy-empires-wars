import { GameState } from '../state/GameState';
import { LandPosition } from '../state/map/land/LandPosition';
import { getLandId } from '../state/map/land/LandId';

import { NO_PLAYER } from '../domain/player/playerRepository';
import { getPlayer } from './playerSelectors';
import { TreasureItem } from '../types/Treasures';
import { SpellName } from '../types/Spell';
import { getArmiesAtPosition } from './armySelectors';
import { getRandomElement } from '../domain/utils/random';
import { LandType } from '../types/Land';
import { BuildingType } from '../types/Building';
import { Alignment } from '../types/Alignment';
import { getPlayerColorValue } from '../domain/ui/playerColors';

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
  illusionMsg?: string;
}
export const getLandInfo = (state: GameState, landPos: LandPosition): LandInfo => {
  const land = getLand(state, landPos);
  const landOwner = getPlayer(state, getLandOwner(state, landPos));
  const landOwnerId = landOwner?.playerProfile.name ?? NO_PLAYER.id;
  const landOwnerColor = getPlayerColorValue(landOwner?.color ?? 'white');

  const isIllusion =
    landOwner?.empireTreasures?.some((t) => t.id === TreasureItem.MIRROR_OF_ILLUSION) ||
    land.effects.some((e) => e.spell === SpellName.ILLUSION);

  const affectedByViewLand = land.effects.some(
    (e) => e.spell === SpellName.VIEW_TERRITORY && e.castBy === state.turnOwner
  );

  if (landOwnerId !== NO_PLAYER.id && (landOwner.id === state.turnOwner || affectedByViewLand)) {
    if (isIllusion && landOwner.id !== state.turnOwner && affectedByViewLand) {
      return {
        owner: landOwnerId,
        color: landOwnerColor,
        type: land.land.id,
        alignment: land.land.alignment,
        goldPerTurn: land.goldPerTurn,
        heroes: [],
        regulars: [],
        buildings: [],
        illusionMsg: getRandomElement(ILLUSION_MESSAGES),
      };
    }

    // provide information about the land for owned territories and territories revealed by VIEW_TERRITORY Spell
    const armies = getArmiesAtPosition(state, landPos);
    return {
      owner: landOwnerId,
      color: landOwnerColor,
      type: land.land.id,
      alignment: land.land.alignment,
      goldPerTurn: land.goldPerTurn,
      heroes: armies.flatMap((a) => a.heroes).map((h) => `${h.name} lvl: ${h.level}`),
      regulars: armies.flatMap((a) => a.regulars).map((r) => `${r.type} (${r.count})`),
      buildings: land.buildings.map((b) => b.id),
    };
  } else {
    return {
      owner: landOwnerId,
      color: landOwnerColor,
      type: land.land.id,
      alignment: land.land.alignment,
      goldPerTurn: land.goldPerTurn,
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
