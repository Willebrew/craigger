'use client';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

export default function GameOverScreen({ score, highScore, onRestart }: GameOverScreenProps) {
  const isNewHighScore = score >= highScore && score > 0;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
      <div className="text-center px-6" style={{ fontFamily: "'Press Start 2P', monospace" }}>
        <h2 className="text-3xl sm:text-5xl font-bold text-red-500 mb-6">
          GAME OVER
        </h2>

        {isNewHighScore && (
          <p className="text-yellow-400 text-sm mb-4 animate-pulse">
            NEW HIGH SCORE!
          </p>
        )}

        <div className="text-white text-sm space-y-2 mb-8">
          <p>SCORE: <span className="text-green-400">{score}</span></p>
          <p>BEST: <span className="text-cyan-400">{highScore}</span></p>
        </div>

        <button
          onClick={onRestart}
          className="px-8 py-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-sm sm:text-base rounded-lg transition-colors pointer-events-auto"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          TRY AGAIN
        </button>

        <p className="mt-4 text-xs text-gray-500">Press Space or Tap to restart</p>
      </div>
    </div>
  );
}
