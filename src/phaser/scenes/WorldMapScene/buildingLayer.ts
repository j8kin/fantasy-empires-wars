import type Phaser from 'phaser';
import type { GameState } from '../../../state/GameState';

/**
 * Clears and redraws the building icon layer.
 *
 * @param container  The Phaser Container at depth 3 owned by WorldMapScene.
 * @param state      Current game state.
 * @param scene      The owning scene (needed for this.add.image in the real impl).
 *
 * STUB: full sprite rendering is implemented in a separate task.
 * For now this only clears the container so wiring is validated end-to-end.
 */

export const drawBuildingLayer = (
  container: Phaser.GameObjects.Container,
  scene: Phaser.Scene,
  state: GameState
): void => {
  container.removeAll(true);
  // TODO: iterate state.map.lands, render one building sprite per tile
};
