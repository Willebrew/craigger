import { Direction } from '../types';

export class InputManager {
  private inputQueue: Direction[] = [];
  private actionPressed = false;
  private lastHopTime = 0;
  private hopCooldown: number;
  private enabled = true;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private swipeThreshold = 30;
  private onDpadInput: ((dir: Direction) => void) | null = null;

  constructor(hopCooldown: number) {
    this.hopCooldown = hopCooldown;
  }

  attach(canvas: HTMLElement): void {
    // Keyboard
    window.addEventListener('keydown', this.handleKeyDown);

    // Touch - swipe detection on canvas
    canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
  }

  detach(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.inputQueue = [];
      this.actionPressed = false;
    }
  }

  consumeDirection(): Direction | null {
    if (!this.enabled) return null;

    const now = performance.now();
    if (now - this.lastHopTime < this.hopCooldown) return null;

    const dir = this.inputQueue.shift() || null;
    if (dir) {
      this.lastHopTime = now;
    }
    return dir;
  }

  consumeAction(): boolean {
    if (!this.enabled) return false;
    const pressed = this.actionPressed;
    this.actionPressed = false;
    return pressed;
  }

  // For d-pad buttons (called from React)
  pushDirection(dir: Direction): void {
    if (!this.enabled) return;
    this.inputQueue.push(dir);
    // Keep queue small
    if (this.inputQueue.length > 2) {
      this.inputQueue.shift();
    }
  }

  pushAction(): void {
    this.actionPressed = true;
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (!this.enabled) return;

    let dir: Direction | null = null;
    switch (e.key) {
      case 'ArrowUp':    case 'w': case 'W': dir = 'up'; break;
      case 'ArrowDown':  case 's': case 'S': dir = 'down'; break;
      case 'ArrowLeft':  case 'a': case 'A': dir = 'left'; break;
      case 'ArrowRight': case 'd': case 'D': dir = 'right'; break;
      case ' ':
      case 'Enter':
        this.actionPressed = true;
        e.preventDefault();
        return;
    }

    if (dir) {
      e.preventDefault();
      this.inputQueue.push(dir);
      if (this.inputQueue.length > 2) {
        this.inputQueue.shift();
      }
    }
  };

  private handleTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = performance.now();
  };

  private handleTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    e.preventDefault();
    if (!this.enabled) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;
    const elapsed = performance.now() - this.touchStartTime;

    // Tap (short + small movement) = action
    if (Math.abs(dx) < this.swipeThreshold && Math.abs(dy) < this.swipeThreshold && elapsed < 300) {
      this.actionPressed = true;
      return;
    }

    // Swipe
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > this.swipeThreshold) {
        this.inputQueue.push(dx > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(dy) > this.swipeThreshold) {
        this.inputQueue.push(dy > 0 ? 'down' : 'up');
      }
    }

    if (this.inputQueue.length > 2) {
      this.inputQueue.shift();
    }
  };
}
