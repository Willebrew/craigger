import { GameConfig, LaneConfig } from './types';

export const GAME_CONFIG: GameConfig = {
  cols: 15,
  rows: 13,
  lives: 4,
  hopCooldown: 100,
  interpolationDuration: 120,
  maxDeltaTime: 50,
};

export const COLORS = {
  startZone: '#3a7d28',
  startZoneDark: '#2d5a1e',
  safeZone: '#8b7355',
  safeZoneLight: '#a08a6a',
  road: '#3a3a3a',
  roadDark: '#2a2a2a',
  sidewalk: '#888888',
  water: '#1565C0',
  waterLight: '#1976D2',
  waterDark: '#0D47A1',
  goal: '#1a3d1a',
  goalPad: '#4a7a2e',
  goalPadGlow: '#6abf3a',
  laneMarking: '#FFD54F',
  car1: '#EF5350',
  car2: '#FF9800',
  car3: '#FFEE58',
  truck1: '#42A5F5',
  truck2: '#AB47BC',
  log: '#6D4C2A',
  logLight: '#8B6914',
  logBark: '#5C3D1A',
  turtle: '#43A047',
  turtleLight: '#66BB6A',
  turtleSubmerged: '#1a5d3a',
  playerBorder: '#ffffff',
  playerGlow: 'rgba(255,255,255,0.4)',
  goalFilled: '#FFD700',
  goalFilledGlow: 'rgba(255,215,0,0.5)',
};

export const LANE_CONFIGS: LaneConfig[] = [
  // Row 0: Goal
  { row: 0, type: 'goal' },
  // Rows 1-5: Water (top to bottom) — slower speeds, wider platforms
  { row: 1, type: 'water', entityType: 'log',    speed: 0.5, direction: 1,  entityWidth: 4, count: 3, color: COLORS.log },
  { row: 2, type: 'water', entityType: 'turtle', speed: 0.45, direction: -1, entityWidth: 3, count: 3, color: COLORS.turtle },
  { row: 3, type: 'water', entityType: 'log',    speed: 0.7, direction: 1,  entityWidth: 5, count: 2, color: COLORS.log },
  { row: 4, type: 'water', entityType: 'turtle', speed: 0.55, direction: -1, entityWidth: 3, count: 4, color: COLORS.turtle },
  { row: 5, type: 'water', entityType: 'log',    speed: 0.4, direction: 1,  entityWidth: 4, count: 3, color: COLORS.log },
  // Row 6: Safe zone
  { row: 6, type: 'safe' },
  // Rows 7-11: Road (top to bottom) — slower, fewer vehicles
  { row: 7,  type: 'road', entityType: 'truck', speed: 0.4, direction: -1, entityWidth: 3, count: 2, color: COLORS.truck1 },
  { row: 8,  type: 'road', entityType: 'car',   speed: 0.65, direction: 1,  entityWidth: 1, count: 3, color: COLORS.car1 },
  { row: 9,  type: 'road', entityType: 'car',   speed: 0.5, direction: -1, entityWidth: 1, count: 3, color: COLORS.car2 },
  { row: 10, type: 'road', entityType: 'car',   speed: 0.75, direction: 1,  entityWidth: 1, count: 3, color: COLORS.car3 },
  { row: 11, type: 'road', entityType: 'truck', speed: 0.45, direction: -1, entityWidth: 2, count: 2, color: COLORS.truck2 },
  // Row 12: Start zone
  { row: 12, type: 'start' },
];

export const GOAL_SLOTS = [1, 4, 7, 10, 13]; // x positions of goal landing pads

export const SCORING = {
  stepForward: 10,
  goalSlot: 200,
  levelComplete: 1000,
};

export const LEVEL_SCALING = {
  speedMultiplierBase: 1.10,
  maxSpeedMultiplier: 2.5,
  turtleDiveFrequencyLevel: 4,
  shorterLogsLevel: 6,
  fasterDiveLevel: 8,
};
