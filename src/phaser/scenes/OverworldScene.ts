import Phaser from 'phaser';
import { phaserEventBus, PhaserEvents } from '../phaserEventBus';

export class OverworldScene extends Phaser.Scene {
  static readonly KEY = 'OverworldScene';

  constructor() {
    super({ key: OverworldScene.KEY });
  }

  create(): void {
    phaserEventBus.emit(PhaserEvents.SCENE_READY, OverworldScene.KEY);
  }
}
