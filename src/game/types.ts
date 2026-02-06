export type GameState = 'menu' | 'playing' | 'dying' | 'gameover' | 'levelcomplete';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type LaneType = 'road' | 'water' | 'safe' | 'goal' | 'start';

export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: 1 | -1; // 1 = right, -1 = left
}

export interface VehicleEntity extends Entity {
  color: string;
}

export interface LogEntity extends Entity {
  color: string;
}

export interface TurtleEntity extends Entity {
  submerged: boolean;
  diveTimer: number;
  diveDuration: number;
  surfaceDuration: number;
}

export interface GoalSlot {
  x: number;
  filled: boolean;
}

export interface LaneConfig {
  row: number;
  type: LaneType;
  entityType?: 'car' | 'truck' | 'log' | 'turtle';
  speed?: number;
  direction?: 1 | -1;
  spawnInterval?: number;
  entityWidth?: number;
  color?: string;
  count?: number;
}

export interface GameConfig {
  cols: number;
  rows: number;
  lives: number;
  hopCooldown: number;
  interpolationDuration: number;
  maxDeltaTime: number;
}

export interface GameCallbacks {
  onStateChange: (state: GameState) => void;
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onLevelChange: (level: number) => void;
  onHighScoreChange: (highScore: number) => void;
}
