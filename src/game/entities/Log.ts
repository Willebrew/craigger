import { GAME_CONFIG } from '../constants';

export class Log {
  x: number;
  y: number;
  width: number;
  height = 1;
  speed: number;
  direction: 1 | -1;
  color: string;

  constructor(x: number, y: number, width: number, speed: number, direction: 1 | -1, color: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.speed = speed;
    this.direction = direction;
    this.color = color;
  }

  update(dt: number, speedMultiplier: number): void {
    this.x += this.speed * this.direction * speedMultiplier * (dt / 1000) * 3;

    const { cols } = GAME_CONFIG;
    if (this.direction === 1 && this.x > cols + 1) {
      this.x = -this.width - 1;
    } else if (this.direction === -1 && this.x + this.width < -1) {
      this.x = cols + 1;
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
