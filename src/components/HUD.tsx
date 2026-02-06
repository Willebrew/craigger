'use client';

interface HUDProps {
  score: number;
  lives: number;
  level: number;
  highScore: number;
}

export default function HUD({ score, lives, level, highScore }: HUDProps) {
  return (
    <div className="absolute top-0 left-0 right-0 pointer-events-none px-3 py-2">
      <div className="flex justify-between items-start" style={{ fontFamily: "'Press Start 2P', monospace" }}>
        <div className="text-white text-xs sm:text-sm">
          <div className="text-green-400">SCORE</div>
          <div>{score}</div>
        </div>
        <div className="text-white text-xs sm:text-sm text-center">
          <div className="text-yellow-400">LVL {level}</div>
          <div className="text-red-400 text-lg">
            {'♥'.repeat(lives)}
          </div>
        </div>
        <div className="text-white text-xs sm:text-sm text-right">
          <div className="text-cyan-400">HIGH</div>
          <div>{highScore}</div>
        </div>
      </div>
    </div>
  );
}
