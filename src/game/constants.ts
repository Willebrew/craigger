import { GameConfig, LaneConfig } from './types';

export const GAME_CONFIG: GameConfig = {
  cols: 15,
  rows: 13,
  lives: 3,
  hopCooldown: 100,
  interpolationDuration: 120,
  maxDeltaTime: 50,
};

export const COLORS = {
  startZone: '#2d5a1e',
  safeZone: '#8b7355',
  road: '#333333',
  water: '#1a4d8f',
  goal: '#1a3d1a',
  goalPad: '#4a7a2e',
  laneMarking: '#666666',
  car1: '#e63946',
  car2: '#f4a261',
  car3: '#e9c46a',
  truck1: '#457b9d',
  truck2: '#6a4c93',
  log: '#8B4513',
  turtle: '#2e8b57',
  turtleSubmerged: '#1a5d3a',
  playerBorder: '#ffffff',
  goalFilled: '#ffd700',
};

export const LANE_CONFIGS: LaneConfig[] = [
  // Row 0: Goal
  { row: 0, type: 'goal' },
  // Rows 1-5: Water (top to bottom)
  { row: 1, type: 'water', entityType: 'log',    speed: 0.8, direction: 1,  entityWidth: 3, count: 3, color: COLORS.log },
  { row: 2, type: 'water', entityType: 'turtle', speed: 0.7, direction: -1, entityWidth: 3, count: 3, color: COLORS.turtle },
  { row: 3, type: 'water', entityType: 'log',    speed: 1.2, direction: 1,  entityWidth: 4, count: 2, color: COLORS.log },
  { row: 4, type: 'water', entityType: 'turtle', speed: 0.9, direction: -1, entityWidth: 2, count: 4, color: COLORS.turtle },
  { row: 5, type: 'water', entityType: 'log',    speed: 0.6, direction: 1,  entityWidth: 3, count: 3, color: COLORS.log },
  // Row 6: Safe zone
  { row: 6, type: 'safe' },
  // Rows 7-11: Road (top to bottom)
  { row: 7,  type: 'road', entityType: 'truck', speed: 0.6, direction: -1, entityWidth: 3, count: 3, color: COLORS.truck1 },
  { row: 8,  type: 'road', entityType: 'car',   speed: 1.0, direction: 1,  entityWidth: 1, count: 4, color: COLORS.car1 },
  { row: 9,  type: 'road', entityType: 'car',   speed: 0.8, direction: -1, entityWidth: 1, count: 3, color: COLORS.car2 },
  { row: 10, type: 'road', entityType: 'car',   speed: 1.2, direction: 1,  entityWidth: 1, count: 4, color: COLORS.car3 },
  { row: 11, type: 'road', entityType: 'truck', speed: 0.7, direction: -1, entityWidth: 2, count: 3, color: COLORS.truck2 },
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
  speedMultiplierBase: 1.15,
  maxSpeedMultiplier: 3.0,
  turtleDiveFrequencyLevel: 3,
  shorterLogsLevel: 5,
  fasterDiveLevel: 7,
};
