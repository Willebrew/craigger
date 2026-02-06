import { Direction, Position } from '../types';
import { GAME_CONFIG } from '../constants';

export class Player {
  x: number;
  y: number;
  private targetX: number;
  private targetY: number;
  private prevX: number;
  private prevY: number;
  private interpolationTimer = 0;
  private moving = false;
  private dying = false;
  private deathTimer = 0;
  private readonly deathDuration = 600;
  private maxForwardRow: number;
  private driftSpeed = 0;
  private driftDirection: 1 | -1 | 0 = 0;
  private driftSpeedMult = 1;

  constructor() {
    const startX = Math.floor(GAME_CONFIG.cols / 2);
    const startY = GAME_CONFIG.rows - 1;
    this.x = startX;
    this.y = startY;
    this.targetX = startX;
    this.targetY = startY;
    this.prevX = startX;
    this.prevY = startY;
    this.maxForwardRow = startY;
  }

  reset(): void {
    const startX = Math.floor(GAME_CONFIG.cols / 2);
    const startY = GAME_CONFIG.rows - 1;
    this.x = startX;
    this.y = startY;
    this.targetX = startX;
    this.targetY = startY;
    this.prevX = startX;
    this.prevY = startY;
    this.moving = false;
    this.dying = false;
    this.deathTimer = 0;
    this.driftSpeed = 0;
    this.driftDirection = 0;
    this.driftSpeedMult = 1;
    this.maxForwardRow = startY;
  }

  resetPosition(): void {
    const startX = Math.floor(GAME_CONFIG.cols / 2);
    const startY = GAME_CONFIG.rows - 1;
    this.x = startX;
    this.y = startY;
    this.targetX = startX;
    this.targetY = startY;
    this.prevX = startX;
    this.prevY = startY;
    this.moving = false;
    this.dying = false;
    this.deathTimer = 0;
    this.driftSpeed = 0;
    this.driftDirection = 0;
    this.driftSpeedMult = 1;
  }

  hop(direction: Direction): boolean {
    if (this.moving || this.dying) return false;

    let nx = this.x;
    let ny = this.y;

    switch (direction) {
      case 'up':    ny -= 1; break;
      case 'down':  ny += 1; break;
      case 'left':  nx -= 1; break;
      case 'right': nx += 1; break;
    }

    // Bounds check
    if (nx < 0 || nx >= GAME_CONFIG.cols || ny < 0 || ny >= GAME_CONFIG.rows) {
      return false;
    }

    this.prevX = this.x;
    this.prevY = this.y;
    this.targetX = nx;
    this.targetY = ny;
    this.interpolationTimer = 0;
    this.moving = true;

    return true;
  }

  // Returns true if this hop moved the player to a new forward-most row
  checkForwardProgress(): boolean {
    if (this.y < this.maxForwardRow) {
      this.maxForwardRow = this.y;
      return true;
    }
    return false;
  }

  resetForwardProgress(): void {
    this.maxForwardRow = GAME_CONFIG.rows - 1;
  }

  update(dt: number): void {
    if (this.dying) {
      this.deathTimer += dt;
      return;
    }

    if (this.moving) {
      this.interpolationTimer += dt;
      const t = Math.min(this.interpolationTimer / GAME_CONFIG.interpolationDuration, 1);

      if (t >= 1) {
        this.x = this.targetX;
        this.y = this.targetY;
        this.moving = false;
      }
    }

    // Apply drift from log/turtle using the exact same formula entities use
    if (this.driftSpeed !== 0 && !this.moving) {
      const drift = this.driftSpeed * this.driftDirection * this.driftSpeedMult * (dt / 1000) * 3;
      this.x += drift;
      this.targetX = this.x;
      this.prevX = this.x;
    }
  }

  applyDrift(speed: number, direction: 1 | -1 | 0, speedMultiplier: number): void {
    this.driftSpeed = speed;
    this.driftDirection = direction;
    this.driftSpeedMult = speedMultiplier;
  }

  clearDrift(): void {
    this.driftSpeed = 0;
    this.driftDirection = 0;
  }

  die(): void {
    if (this.dying) return;
    this.dying = true;
    this.deathTimer = 0;
    this.moving = false;
  }

  isDying(): boolean {
    return this.dying;
  }

  isDeathComplete(): boolean {
    return this.dying && this.deathTimer >= this.deathDuration;
  }

  getDeathProgress(): number {
    return Math.min(this.deathTimer / this.deathDuration, 1);
  }

  isMoving(): boolean {
    return this.moving;
  }

  getRenderPosition(): Position {
    if (this.dying) {
      return { x: this.x, y: this.y };
    }
    if (!this.moving) {
      return { x: this.x, y: this.y };
    }
    const t = Math.min(this.interpolationTimer / GAME_CONFIG.interpolationDuration, 1);
    // Ease out
    const eased = 1 - (1 - t) * (1 - t);
    return {
      x: this.prevX + (this.targetX - this.prevX) * eased,
      y: this.prevY + (this.targetY - this.prevY) * eased,
    };
  }

  getGridPosition(): Position {
    return { x: Math.round(this.x), y: this.y };
  }
}
