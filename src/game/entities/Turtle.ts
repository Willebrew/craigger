import { GAME_CONFIG } from '../constants';
import { COLORS } from '../constants';

export class Turtle {
  x: number;
  y: number;
  width: number;
  height = 1;
  speed: number;
  direction: 1 | -1;
  color: string;
  submerged = false;
  diveTimer = 0;
  surfaceDuration: number;
  diveDuration: number;

  constructor(
    x: number, y: number, width: number, speed: number,
    direction: 1 | -1, color: string,
    surfaceDuration = 3000, diveDuration = 1000,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.speed = speed;
    this.direction = direction;
    this.color = color;
    this.surfaceDuration = surfaceDuration;
    this.diveDuration = diveDuration;
    // Randomize initial dive timer so they don't all dive at once
    this.diveTimer = Math.random() * surfaceDuration;
  }

  update(dt: number, speedMultiplier: number): void {
    // Movement
    this.x += this.speed * this.direction * speedMultiplier * (dt / 1000) * 3;

    const { cols } = GAME_CONFIG;
    if (this.direction === 1 && this.x > cols + 1) {
      this.x = -this.width - 1;
    } else if (this.direction === -1 && this.x + this.width < -1) {
      this.x = cols + 1;
    }

    // Dive cycle
    this.diveTimer += dt;
    if (!this.submerged && this.diveTimer >= this.surfaceDuration) {
      this.submerged = true;
      this.diveTimer = 0;
      this.color = COLORS.turtleSubmerged;
    } else if (this.submerged && this.diveTimer >= this.diveDuration) {
      this.submerged = false;
      this.diveTimer = 0;
      this.color = COLORS.turtle;
    }
  }

  getVelocity(speedMultiplier: number): number {
    return this.speed * this.direction * speedMultiplier * (1 / 1000) * 3;
  }

  getHitbox(): { x: number; y: number; w: number; h: number } {
    return {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height,
    };
  }
}
