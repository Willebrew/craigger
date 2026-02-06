import { LEVEL_SCALING } from '../constants';

export class LevelManager {
  level = 1;

  reset(): void {
    this.level = 1;
  }

  nextLevel(): void {
    this.level++;
  }

  getSpeedMultiplier(): number {
    const mult = Math.pow(LEVEL_SCALING.speedMultiplierBase, this.level - 1);
    return Math.min(mult, LEVEL_SCALING.maxSpeedMultiplier);
  }
}
