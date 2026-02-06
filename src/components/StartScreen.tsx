'use client';

interface StartScreenProps {
  onStart: () => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
      <div className="text-center px-6" style={{ fontFamily: "'Press Start 2P', monospace" }}>
        <h1 className="text-4xl sm:text-6xl font-bold text-green-400 mb-2">
          CRAIGGER
        </h1>
        <p className="text-sm text-gray-400 mb-8">A Craig-Inspired Adventure</p>

        <button
          onClick={onStart}
          className="px-8 py-4 bg-green-600 hover:bg-green-500 active:bg-green-700 text-white text-sm sm:text-base rounded-lg transition-colors pointer-events-auto animate-pulse"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          START GAME
        </button>

        <div className="mt-8 text-xs text-gray-500 space-y-1">
          <p>Arrow Keys / WASD to move</p>
          <p>Swipe or use D-Pad on mobile</p>
        </div>
      </div>
    </div>
  );
}
