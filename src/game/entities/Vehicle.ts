import { GAME_CONFIG } from '../constants';

export class Vehicle {
  x: number;
  y: number;
  width: number;
  height = 1;
  speed: number;
  direction: 1 | -1;
  color: string;
  active = true;

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

    // Wrap around
    const { cols } = GAME_CONFIG;
    if (this.direction === 1 && this.x > cols + 1) {
      this.x = -this.width - 1;
    } else if (this.direction === -1 && this.x + this.width < -1) {
      this.x = cols + 1;
    }
  }

  getHitbox(): { x: number; y: number; w: number; h: number } {
    const shrink = 0.2; // 60% hitbox — very forgiving
    return {
      x: this.x + shrink,
      y: this.y + shrink,
      w: this.width - shrink * 2,
      h: this.height - shrink * 2,
    };
  }
}
