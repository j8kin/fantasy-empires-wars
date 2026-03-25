import { useRef, useEffect, useCallback } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { getLandId } from '../../state/map/land/LandId';
import { getLandOwner, getPlayerLands, getRealmLands, getTilesInRadius } from '../../selectors/landSelectors';
import { getDiplomacyStatus, getTreasureItemById, getTurnOwner } from '../../selectors/playerSelectors';
import { getArmiesAtPosition, isMoving } from '../../selectors/armySelectors';
import { getSpellById } from '../../selectors/spellSelectors';
import { getBuildingInfo } from '../../domain/building/buildingRepository';
import { calculateTileScreenPosition, getMapDimensions } from '../../utils/screenPositionUtils';
import { construct } from '../../map/building/construct';
import { castSpell } from '../../map/magic/castSpell';
import { invokeItem } from '../../map/magic/invokeItem';
import { calcMaxMove, MAX_DISTANCE_FROM_REALM } from '../../map/move-army/calcMaxMove';
import { getRandomElement } from '../../domain/utils/random';
import { MIN_HERO_COMBINED_LEVEL_FOR_MOVEMENT } from '../../map/move-army/startMovement';
import { SpellName } from '../../types/Spell';
import { EmpireEventKind } from '../../types/EmpireEvent';
import { Alignment } from '../../types/Alignment';
import { NO_PLAYER } from '../../domain/player/playerRepository';
import { DiplomacyStatus } from '../../types/Diplomacy';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { SpellType } from '../../types/Spell';
import type { BuildingType } from '../../types/Building';
import type { TreasureType } from '../../types/Treasures';

const itemLostMessage = (item: TreasureType): string => {
  const message = [
    `With a final whisper, ${item} crumbles into lifeless dust.`,
    `The magic bound to ${item} fades, leaving only ash behind.`,
    `A hollow echo rings as ${item} shatters into nothingness.`,
    `The power within ${item} collapses, undone by its own use.`,
    `Orrivane reclaims what was borrowed—${item} is no more.`,
    `Bound power disperses; ${item} has served its final hour.`,
    `${item} breaks, spent beyond recovery.`,
    `Nothing remains of ${item} but scattered fragments.`,
  ];
  return getRandomElement(message);
};

/**
 * Returns a stable `performActionAtPosition` callback that replicates the
 * tile-click logic from LandTile.tsx. Used by the Phaser event bridge so
 * that clicking a hex in the Phaser canvas has the same effect as clicking
 * the same hex in the React Battlefield.
 */
export const useLandAction = () => {
  const appCtx = useApplicationContext();
  const { gameState, updateGameState } = useGameContext();

  // Use a ref so the callback stays stable (won't trigger useEffect re-runs in callers)
  const stateRef = useRef({ appCtx, gameState, updateGameState });
  useEffect(() => {
    stateRef.current = { appCtx, gameState, updateGameState };
  });

  const performActionAtPosition = useCallback((pos: LandPosition) => {
    const { appCtx, gameState, updateGameState } = stateRef.current;
    const {
      selectedLandAction,
      setSelectedLandAction,
      glowingTiles,
      clearAllGlow,
      addGlowingTile,
      setActionLandPosition,
      actionLandPosition,
      setShowRecruitArmyDialog,
      setShowSendHeroInQuestDialog,
      setMoveArmyPath,
      showSpellAnimation,
      showEmpireEvents,
    } = appCtx;

    const tileId = getLandId(pos);
    const land = gameState?.map.lands[tileId];
    const isGlowing = glowingTiles.has(tileId) || land?.glow;

    if (!gameState || !isGlowing) return;

    if (selectedLandAction?.startsWith('Spell: ')) {
      if (selectedLandAction?.includes(SpellName.TELEPORT)) {
        if (selectedLandAction?.includes('TeleportTo')) {
          const spellToCast = getSpellById(SpellName.TELEPORT);
          const screenPosition = calculateTileScreenPosition(pos, getMapDimensions(gameState));
          showSpellAnimation(spellToCast.manaType, pos, screenPosition);
          castSpell(gameState, SpellName.TELEPORT, actionLandPosition!, pos);
          clearAllGlow();
          setSelectedLandAction(null);
          return;
        }
        clearAllGlow();
        setActionLandPosition(pos);
        setSelectedLandAction(`${selectedLandAction}To`);
        getPlayerLands(gameState)
          .flatMap((l) => getLandId(l.mapPos))
          .filter((l) => l !== tileId)
          .forEach((l) => addGlowingTile(l));
        return;
      }

      const spellToCast = getSpellById(selectedLandAction?.substring(7) as SpellType);
      const selectedPlayer = gameState?.turnOwner;
      if (selectedPlayer) {
        const screenPosition = calculateTileScreenPosition(pos, getMapDimensions(gameState));
        showSpellAnimation(spellToCast.manaType, pos, screenPosition);
        castSpell(gameState, spellToCast.type, pos);
        updateGameState(gameState);
      }
    } else if (selectedLandAction?.startsWith('Item: ')) {
      const itemId = selectedLandAction?.substring(6);
      if (itemId) {
        const item = getTreasureItemById(getTurnOwner(gameState), itemId)!;
        invokeItem(gameState, itemId, pos);
        if (!getTreasureItemById(getTurnOwner(gameState), itemId)) {
          showEmpireEvents([
            {
              status: EmpireEventKind.Negative,
              message: itemLostMessage(item.treasure.type),
            },
          ]);
        }
        updateGameState(gameState);
      }
    } else if (selectedLandAction?.startsWith('Building: ')) {
      const buildingToConstruct = selectedLandAction?.substring(10) as BuildingType;
      const selectedPlayer = getTurnOwner(gameState);
      if (selectedPlayer && selectedPlayer.vault! >= getBuildingInfo(buildingToConstruct).buildCost) {
        construct(gameState, buildingToConstruct, pos);
        updateGameState(gameState);
      }
    } else if (selectedLandAction === 'Recruit') {
      setActionLandPosition(pos);
      setShowRecruitArmyDialog(true);
    } else if (selectedLandAction === 'Quest') {
      setActionLandPosition(pos);
      setShowSendHeroInQuestDialog(true);
    } else if (selectedLandAction === 'MoveArmyFrom') {
      clearAllGlow();
      setActionLandPosition(pos);
      setSelectedLandAction('MoveArmyTo');

      const realmLands = getRealmLands(gameState).map((l) => l.mapPos);
      const armiesAtPosition = getArmiesAtPosition(gameState!, pos).filter((a) => !isMoving(a));
      const maxMovements = calcMaxMove(armiesAtPosition.flatMap((a) => a.regulars));
      const cumulativeHeroesLevel = armiesAtPosition.reduce(
        (acc, army) => acc + army.heroes.reduce((acc2, hero) => acc2 + hero.level, 0),
        0
      );
      const turnOwner = getTurnOwner(gameState);
      const isChaotic = turnOwner.playerProfile.alignment === Alignment.CHAOTIC;

      const landsInRadius = getTilesInRadius(
        gameState!.map.dimensions,
        pos,
        cumulativeHeroesLevel >= MIN_HERO_COMBINED_LEVEL_FOR_MOVEMENT ? MAX_DISTANCE_FROM_REALM : maxMovements
      ).filter((p) => {
        if (isChaotic) return true;
        const landOwner = getLandOwner(gameState, p);
        if (landOwner === turnOwner.id || landOwner === NO_PLAYER.id) return true;
        const diplomacyStatus = getDiplomacyStatus(gameState, gameState!.turnOwner, landOwner);
        return diplomacyStatus === DiplomacyStatus.WAR || diplomacyStatus === DiplomacyStatus.ALLIANCE;
      });

      const moveToLands: LandPosition[] = Array.from(
        new Map<string, LandPosition>(
          [...realmLands, ...landsInRadius].map((p): [string, LandPosition] => [`${p.row}:${p.col}`, p])
        ).values()
      );

      moveToLands.forEach((land) => addGlowingTile(getLandId(land)));
      return;
    } else if (selectedLandAction === 'MoveArmyTo') {
      setMoveArmyPath({ from: actionLandPosition!, to: pos });
    } else {
      alert(`Unknown action for Land ${tileId}. Action item: ${JSON.stringify(selectedLandAction)}`);
    }

    clearAllGlow();
    setSelectedLandAction(null);
  }, []); // Stable — reads latest state via ref

  return { performActionAtPosition };
};
