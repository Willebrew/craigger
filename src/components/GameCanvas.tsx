'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GameState } from '../game/types';
import { Direction } from '../game/types';
import HUD from './HUD';
import StartScreen from './StartScreen';
import GameOverScreen from './GameOverScreen';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);

  const handleStart = useCallback(() => {
    engineRef.current?.startGame();
  }, []);

  const handleRestart = useCallback(() => {
    engineRef.current?.restartGame();
  }, []);

  const handleDpad = useCallback((dir: Direction) => {
    engineRef.current?.getInput().pushDirection(dir);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, {
      onStateChange: setGameState,
      onScoreChange: setScore,
      onLivesChange: setLives,
      onLevelChange: setLevel,
      onHighScoreChange: setHighScore,
    });

    engineRef.current = engine;

    let mounted = true;

    engine.init().then(() => {
      if (mounted) {
        engine.start();
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      if (mounted) {
        engine.handleResize();
      }
    });
    resizeObserver.observe(canvas);

    return () => {
      mounted = false;
      engine.stop();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: 'none' }}
      />

      {gameState === 'playing' || gameState === 'dying' || gameState === 'levelcomplete' ? (
        <HUD score={score} lives={lives} level={level} highScore={highScore} />
      ) : null}

      {gameState === 'menu' && (
        <StartScreen onStart={handleStart} />
      )}

      {gameState === 'gameover' && (
        <GameOverScreen score={score} highScore={highScore} onRestart={handleRestart} />
      )}

      {gameState === 'levelcomplete' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-4xl font-bold text-yellow-400 animate-pulse" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              LEVEL {level} COMPLETE!
            </p>
          </div>
        </div>
      )}

      {/* D-pad for mobile */}
      {(gameState === 'playing' || gameState === 'dying') && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden pointer-events-auto"
          style={{ touchAction: 'none', zIndex: 50 }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-3 gap-1" style={{ width: '168px' }}>
            <div />
            <button
              className="w-14 h-14 bg-white/25 rounded-lg active:bg-white/50 flex items-center justify-center text-white text-2xl select-none"
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); handleDpad('up'); }}
            >
              ▲
            </button>
            <div />
            <button
              className="w-14 h-14 bg-white/25 rounded-lg active:bg-white/50 flex items-center justify-center text-white text-2xl select-none"
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); handleDpad('left'); }}
            >
              ◀
            </button>
            <div />
            <button
              className="w-14 h-14 bg-white/25 rounded-lg active:bg-white/50 flex items-center justify-center text-white text-2xl select-none"
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); handleDpad('right'); }}
            >
              ▶
            </button>
            <div />
            <button
              className="w-14 h-14 bg-white/25 rounded-lg active:bg-white/50 flex items-center justify-center text-white text-2xl select-none"
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); handleDpad('down'); }}
            >
              ▼
            </button>
            <div />
          </div>
        </div>
      )}
    </div>
  );
}
