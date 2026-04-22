import type Phaser from 'phaser';
import type { GameState } from '../../../state/GameState';
import { getLandInfo, getLandOwner, getVisibleLands } from '../../../selectors/landSelectors';
import { getPlayer } from '../../../selectors/playerSelectors';
import { getArmiesAtPosition } from '../../../selectors/armySelectors';
import { getArmyFigureImg } from '../../../assets/getArmyFigureImg';
import { axialToPixel, offsetToAxial } from '../../utils/hexGeometry';
import { HEX_SIZE } from '../../utils/hexGeometry';

export const drawArmyFiguresLayer = (
  container: Phaser.GameObjects.Container,
  scene: Phaser.Scene,
  state: GameState
) => {
  container.removeAll(true);

  getVisibleLands(state).forEach((landPos) => {
    const { q, r } = offsetToAxial(landPos);
    const center = axialToPixel(q, r);

    const info = getLandInfo(state, landPos);
    if (info.heroes.length > 0 || info.regulars.length > 0 || info.illusionMsg != null) {
      // place figure
      const isIllusion = info.illusionMsg != null;
      const landOwnerRace = getPlayer(state, getLandOwner(state, landPos)).playerProfile.race;
      const heroes = !isIllusion ? getArmiesAtPosition(state, landPos).flatMap((a) => a.heroes) : [];
      const assetKey = getArmyFigureImg(landOwnerRace, heroes, isIllusion || info.regulars.length > 0);
      if (!scene.textures?.exists(assetKey)) return;

      try {
        const img = scene.add.image(center.x, center.y - 20, assetKey);
        const scale = (HEX_SIZE * 1.7) / Math.max(img.width, img.height);
        img.setScale(scale);
        container.add(img);
      } catch (e) {
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
          console.warn(`Failed to render figure for race ${landOwnerRace}:`, e);
        }
      }
    }
  });
};
