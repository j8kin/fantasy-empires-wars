import Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import { OverworldScene } from './scenes/OverworldScene';
import { useGameContext } from '../contexts/GameContext';
import { phaserEventBus, PhaserEvents } from './phaserEventBus';

export function PhaserGameInstance() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneReadyRef = useRef(false);
  const { gameState } = useGameContext();

  // Initialize Phaser game
  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current!,
      width: '100%',
      height: '100%',
      backgroundColor: '#2b2b2b',
      scene: [OverworldScene],
    });
    gameRef.current = game;

    // Listen for SCENE_READY event
    const onSceneReady = () => {
      sceneReadyRef.current = true;
      // Emit current gameState if available
      if (gameState) {
        phaserEventBus.emit(PhaserEvents.STATE_UPDATE, gameState);
      }
    };

    phaserEventBus.on(PhaserEvents.SCENE_READY, onSceneReady);

    return () => {
      phaserEventBus.off(PhaserEvents.SCENE_READY, onSceneReady);
      game.destroy(true);
    };
  }, []);

  // Emit gameState updates to Phaser scene (only after scene is ready)
  useEffect(() => {
    if (gameState && gameRef.current && sceneReadyRef.current) {
      phaserEventBus.emit(PhaserEvents.STATE_UPDATE, gameState);
    }
  }, [gameState]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
