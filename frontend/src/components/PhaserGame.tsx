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
  const onGameReadyRef = useRef(onGameReady);
  const onSceneReadyRef = useRef(onSceneReady);

  useEffect(() => {
    onGameReadyRef.current = onGameReady;
    onSceneReadyRef.current = onSceneReady;
  });

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config = createGameConfig(containerRef.current);
    const game = new Phaser.Game(config);
    gameRef.current = game;
    (window as unknown as { __PHASER_GAME__?: Phaser.Game }).__PHASER_GAME__ = game;

    if (onGameReadyRef.current) {
      onGameReadyRef.current(game);
    }

    const handleSceneReady = (scene: MainScene) => {
      (window as unknown as { __PHASER_SCENE__?: MainScene }).__PHASER_SCENE__ = scene;
      if (onSceneReadyRef.current) {
        onSceneReadyRef.current(scene);
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
  }, []);

  return (
    <div
      ref={containerRef}
      className="phaser-viewport-container"
      tabIndex={0}
      onMouseDown={() => {
        containerRef.current?.focus();
      }}
    />
  );
};
