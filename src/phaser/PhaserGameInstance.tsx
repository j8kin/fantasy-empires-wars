import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { OverworldScene } from './scenes/OverworldScene';

export function PhaserGameInstance() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current!,
      width: '100%',
      height: '100%',
      backgroundColor: '#1a1a2e',
      scene: [OverworldScene],
    });
    return () => game.destroy(true);
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
