import { GAME_CONFIG, COLORS, LANE_CONFIGS, GOAL_SLOTS } from '../constants';
import { GoalSlot, LaneType } from '../types';
import { Player } from '../entities/Player';
import { Vehicle } from '../entities/Vehicle';
import { Log } from '../entities/Log';
import { Turtle } from '../entities/Turtle';
import { SpriteSheet } from './SpriteSheet';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private cellSize = 0;
  private offsetX = 0;
  private offsetY = 0;
  private sprite: SpriteSheet;

  constructor(ctx: CanvasRenderingContext2D, sprite: SpriteSheet) {
    this.ctx = ctx;
    this.sprite = sprite;
  }

  resize(canvasWidth: number, canvasHeight: number, dpr: number): void {
    const { cols, rows } = GAME_CONFIG;
    const aspectRatio = cols / rows;
    const viewAspect = canvasWidth / canvasHeight;

    let drawWidth: number, drawHeight: number;
    if (viewAspect > aspectRatio) {
      drawHeight = canvasHeight;
      drawWidth = drawHeight * aspectRatio;
    } else {
      drawWidth = canvasWidth;
      drawHeight = drawWidth / aspectRatio;
    }

    this.cellSize = Math.floor(drawWidth / cols);
    drawWidth = this.cellSize * cols;
    drawHeight = this.cellSize * rows;
    this.offsetX = Math.floor((canvasWidth - drawWidth) / 2);
    this.offsetY = Math.floor((canvasHeight - drawHeight) / 2);

    this.sprite.clearCache();
  }

  getCellSize(): number {
    return this.cellSize;
  }

  getOffset(): { x: number; y: number } {
    return { x: this.offsetX, y: this.offsetY };
  }

  clear(): void {
    const { ctx } = this;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  drawBackground(): void {
    const { ctx, cellSize, offsetX, offsetY } = this;
    const { cols } = GAME_CONFIG;

    for (const lane of LANE_CONFIGS) {
      let color: string;
      switch (lane.type) {
        case 'goal':   color = COLORS.goal; break;
        case 'water':  color = COLORS.water; break;
        case 'safe':   color = COLORS.safeZone; break;
        case 'road':   color = COLORS.road; break;
        case 'start':  color = COLORS.startZone; break;
        default:       color = '#000';
      }
      ctx.fillStyle = color;
      ctx.fillRect(offsetX, offsetY + lane.row * cellSize, cols * cellSize, cellSize);
    }

    // Lane markings on road
    ctx.setLineDash([cellSize * 0.3, cellSize * 0.3]);
    ctx.strokeStyle = COLORS.laneMarking;
    ctx.lineWidth = 2;
    for (let row = 8; row <= 11; row++) {
      const y = offsetY + row * cellSize;
      ctx.beginPath();
      ctx.moveTo(offsetX, y);
      ctx.lineTo(offsetX + cols * cellSize, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  drawGoalSlots(goalSlots: GoalSlot[]): void {
    const { ctx, cellSize, offsetX, offsetY } = this;
    for (const slot of goalSlots) {
      ctx.fillStyle = slot.filled ? COLORS.goalFilled : COLORS.goalPad;
      const x = offsetX + slot.x * cellSize;
      const y = offsetY;
      const padding = cellSize * 0.1;
      ctx.fillRect(x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2);

      if (slot.filled) {
        // Draw a small indicator
        ctx.fillStyle = '#fff';
        ctx.font = `${cellSize * 0.5}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', x + cellSize / 2, y + cellSize / 2);
      }
    }
  }

  drawVehicles(vehicles: Vehicle[]): void {
    const { ctx, cellSize, offsetX, offsetY } = this;
    for (const v of vehicles) {
      ctx.fillStyle = v.color;
      const x = offsetX + v.x * cellSize;
      const y = offsetY + v.y * cellSize;
      const w = v.width * cellSize;
      const h = cellSize * 0.8;
      const yOff = cellSize * 0.1;

      // Rounded rectangle
      const r = cellSize * 0.15;
      ctx.beginPath();
      ctx.moveTo(x + r, y + yOff);
      ctx.lineTo(x + w - r, y + yOff);
      ctx.quadraticCurveTo(x + w, y + yOff, x + w, y + yOff + r);
      ctx.lineTo(x + w, y + yOff + h - r);
      ctx.quadraticCurveTo(x + w, y + yOff + h, x + w - r, y + yOff + h);
      ctx.lineTo(x + r, y + yOff + h);
      ctx.quadraticCurveTo(x, y + yOff + h, x, y + yOff + h - r);
      ctx.lineTo(x, y + yOff + r);
      ctx.quadraticCurveTo(x, y + yOff, x + r, y + yOff);
      ctx.closePath();
      ctx.fill();

      // Windshield detail for cars
      if (v.width <= 1.2) {
        ctx.fillStyle = 'rgba(135,206,250,0.6)';
        const wsX = v.direction === 1 ? x + w * 0.6 : x + w * 0.1;
        ctx.fillRect(wsX, y + yOff + h * 0.15, w * 0.25, h * 0.7);
      }

      // Headlights
      ctx.fillStyle = 'rgba(255,255,200,0.8)';
      const hlX = v.direction === 1 ? x + w - cellSize * 0.08 : x;
      ctx.fillRect(hlX, y + yOff + h * 0.2, cellSize * 0.08, h * 0.2);
      ctx.fillRect(hlX, y + yOff + h * 0.6, cellSize * 0.08, h * 0.2);
    }
  }

  drawLogs(logs: Log[]): void {
    const { ctx, cellSize, offsetX, offsetY } = this;
    for (const log of logs) {
      const x = offsetX + log.x * cellSize;
      const y = offsetY + log.y * cellSize;
      const w = log.width * cellSize;
      const h = cellSize * 0.8;
      const yOff = cellSize * 0.1;
      const r = cellSize * 0.2;

      // Main log body
      ctx.fillStyle = log.color;
      ctx.beginPath();
      ctx.moveTo(x + r, y + yOff);
      ctx.lineTo(x + w - r, y + yOff);
      ctx.quadraticCurveTo(x + w, y + yOff, x + w, y + yOff + r);
      ctx.lineTo(x + w, y + yOff + h - r);
      ctx.quadraticCurveTo(x + w, y + yOff + h, x + w - r, y + yOff + h);
      ctx.lineTo(x + r, y + yOff + h);
      ctx.quadraticCurveTo(x, y + yOff + h, x, y + yOff + h - r);
      ctx.lineTo(x, y + yOff + r);
      ctx.quadraticCurveTo(x, y + yOff, x + r, y + yOff);
      ctx.closePath();
      ctx.fill();

      // Wood grain lines
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      for (let i = 1; i < log.width; i++) {
        const lx = x + i * cellSize;
        ctx.beginPath();
        ctx.moveTo(lx, y + yOff + 2);
        ctx.lineTo(lx, y + yOff + h - 2);
        ctx.stroke();
      }

      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(x + r, y + yOff, w - r * 2, h * 0.3);
    }
  }

  drawTurtles(turtles: Turtle[]): void {
    const { ctx, cellSize, offsetX, offsetY } = this;
    for (const turtle of turtles) {
      const baseX = offsetX + turtle.x * cellSize;
      const y = offsetY + turtle.y * cellSize;
      const turtleRadius = cellSize * 0.35;

      for (let i = 0; i < turtle.width; i++) {
        const cx = baseX + (i + 0.5) * cellSize;
        const cy = y + cellSize * 0.5;

        if (turtle.submerged) {
          // Submerged: just ripples
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(cx, cy, turtleRadius * 0.8, turtleRadius * 0.3, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Shell
          ctx.fillStyle = turtle.color;
          ctx.beginPath();
          ctx.arc(cx, cy, turtleRadius, 0, Math.PI * 2);
          ctx.fill();

          // Shell pattern
          ctx.strokeStyle = 'rgba(0,0,0,0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, turtleRadius * 0.6, 0, Math.PI * 2);
          ctx.stroke();

          // Head
          ctx.fillStyle = '#3a6b35';
          const headX = turtle.direction === -1 ? cx - turtleRadius * 0.9 : cx + turtleRadius * 0.9;
          ctx.beginPath();
          ctx.arc(headX, cy, turtleRadius * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  drawPlayer(player: Player): void {
    const { ctx, cellSize, offsetX, offsetY } = this;
    const pos = player.getRenderPosition();
    const x = offsetX + pos.x * cellSize;
    const y = offsetY + pos.y * cellSize;
    const size = cellSize * 0.9;
    const cx = x + cellSize / 2;
    const cy = y + cellSize / 2;
    const radius = size / 2;

    if (player.isDying()) {
      // Death animation: shrinking + rotating
      const deathProgress = player.getDeathProgress();
      const scale = 1 - deathProgress;
      const rotation = deathProgress * Math.PI * 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);

      // Draw red X
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-radius * 0.6, -radius * 0.6);
      ctx.lineTo(radius * 0.6, radius * 0.6);
      ctx.moveTo(radius * 0.6, -radius * 0.6);
      ctx.lineTo(-radius * 0.6, radius * 0.6);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // White border
    ctx.fillStyle = COLORS.playerBorder;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
    ctx.fill();

    // Player sprite
    const spriteCanvas = this.sprite.getScaled(Math.ceil(size));
    if (spriteCanvas) {
      ctx.drawImage(spriteCanvas, cx - radius, cy - radius, size, size);
    } else {
      // Fallback circle
      ctx.fillStyle = '#FFD93D';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  render(
    player: Player,
    vehicles: Vehicle[],
    logs: Log[],
    turtles: Turtle[],
    goalSlots: GoalSlot[],
  ): void {
    this.clear();
    this.drawBackground();
    this.drawGoalSlots(goalSlots);
    this.drawLogs(logs);
    this.drawTurtles(turtles);
    this.drawVehicles(vehicles);
    this.drawPlayer(player);
  }
}
