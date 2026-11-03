import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { createGameConfig } from '../game/config';
import type { MainScene } from '../game/scenes/MainScene';

interface PhaserGameProps {
  onGameReady?: (game: Phaser.Game) => void;
  onSceneReady?: (scene: MainScene) => void;
}

export const PhaserGame = ({ onGameReady, onSceneReady }: PhaserGameProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config = createGameConfig(containerRef.current);
    const game = new Phaser.Game(config);
    gameRef.current = game;

    if (onGameReady) {
      onGameReady(game);
    }

    const handleSceneReady = (scene: MainScene) => {
      if (onSceneReady) {
        onSceneReady(scene);
      }
    };

    game.events.on('scene-ready', handleSceneReady);

    const handleResize = () => {
      if (gameRef.current) {
        gameRef.current.scale.refresh();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameRef.current) {
        gameRef.current.events.off('scene-ready', handleSceneReady);
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onGameReady, onSceneReady]);

  return <div ref={containerRef} className="phaser-viewport-container" />;
};
