import { GAME_CONFIG, COLORS, LANE_CONFIGS } from '../constants';
import { GoalSlot } from '../types';
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
  private frameCount = 0;

  constructor(ctx: CanvasRenderingContext2D, sprite: SpriteSheet) {
    this.ctx = ctx;
    this.sprite = sprite;
  }

  resize(canvasWidth: number, canvasHeight: number, _dpr: number): void {
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
    this.offsetX = Math.floor((canvasWidth - this.cellSize * cols) / 2);
    this.offsetY = Math.floor((canvasHeight - this.cellSize * rows) / 2);
    this.sprite.clearCache();
  }

  getCellSize(): number { return this.cellSize; }
  getOffset(): { x: number; y: number } { return { x: this.offsetX, y: this.offsetY }; }

  clear(): void {
    const { ctx } = this;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  // ── Background ──────────────────────────────────────────
  drawBackground(): void {
    const { ctx, cellSize, offsetX, offsetY, frameCount } = this;
    const { cols } = GAME_CONFIG;
    const W = cols * cellSize;

    for (const lane of LANE_CONFIGS) {
      const lx = offsetX;
      const ly = offsetY + lane.row * cellSize;

      switch (lane.type) {
        case 'water': {
          // Animated water gradient
          const grad = ctx.createLinearGradient(lx, ly, lx, ly + cellSize);
          grad.addColorStop(0, COLORS.waterDark);
          grad.addColorStop(0.5, COLORS.water);
          grad.addColorStop(1, COLORS.waterLight);
          ctx.fillStyle = grad;
          ctx.fillRect(lx, ly, W, cellSize);

          // Animated wave shimmer
          ctx.strokeStyle = 'rgba(255,255,255,0.08)';
          ctx.lineWidth = 1;
          const waveOffset = (frameCount * 0.8 + lane.row * 40) % (cellSize * 2);
          for (let wx = -cellSize; wx < W + cellSize; wx += cellSize * 0.8) {
            ctx.beginPath();
            const startX = lx + wx + waveOffset;
            ctx.moveTo(startX, ly + cellSize * 0.3);
            ctx.quadraticCurveTo(
              startX + cellSize * 0.2, ly + cellSize * 0.2,
              startX + cellSize * 0.4, ly + cellSize * 0.3,
            );
            ctx.stroke();
          }
          break;
        }
        case 'road': {
          // Asphalt with subtle noise
          ctx.fillStyle = COLORS.road;
          ctx.fillRect(lx, ly, W, cellSize);
          // Darker bottom edge for depth
          ctx.fillStyle = COLORS.roadDark;
          ctx.fillRect(lx, ly + cellSize - 2, W, 2);
          break;
        }
        case 'safe': {
          // Sidewalk / median with pattern
          const sGrad = ctx.createLinearGradient(lx, ly, lx, ly + cellSize);
          sGrad.addColorStop(0, COLORS.safeZoneLight);
          sGrad.addColorStop(1, COLORS.safeZone);
          ctx.fillStyle = sGrad;
          ctx.fillRect(lx, ly, W, cellSize);
          // Brick pattern
          ctx.strokeStyle = 'rgba(0,0,0,0.1)';
          ctx.lineWidth = 1;
          for (let bx = 0; bx < cols; bx++) {
            const brickX = lx + bx * cellSize;
            ctx.strokeRect(brickX + 2, ly + 2, cellSize - 4, cellSize / 2 - 3);
            ctx.strokeRect(brickX + cellSize / 2 + 2, ly + cellSize / 2 + 1, cellSize - 4, cellSize / 2 - 3);
          }
          break;
        }
        case 'goal': {
          // Dark garden area
          const gGrad = ctx.createLinearGradient(lx, ly, lx, ly + cellSize);
          gGrad.addColorStop(0, '#0d2b0d');
          gGrad.addColorStop(1, COLORS.goal);
          ctx.fillStyle = gGrad;
          ctx.fillRect(lx, ly, W, cellSize);
          // Decorative bushes between goal pads
          ctx.fillStyle = '#1a4a1a';
          for (let bx = 0; bx < cols; bx++) {
            const bushX = lx + bx * cellSize + cellSize / 2;
            const bushY = ly + cellSize / 2;
            ctx.beginPath();
            ctx.arc(bushX, bushY, cellSize * 0.25, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'start': {
          // Grass with texture
          const grassGrad = ctx.createLinearGradient(lx, ly, lx, ly + cellSize);
          grassGrad.addColorStop(0, COLORS.startZone);
          grassGrad.addColorStop(1, COLORS.startZoneDark);
          ctx.fillStyle = grassGrad;
          ctx.fillRect(lx, ly, W, cellSize);
          // Grass blades
          ctx.strokeStyle = 'rgba(100,200,50,0.2)';
          ctx.lineWidth = 1;
          for (let gx = 0; gx < W; gx += cellSize * 0.3) {
            const bladeH = cellSize * (0.15 + Math.sin(gx * 0.1) * 0.05);
            ctx.beginPath();
            ctx.moveTo(lx + gx, ly + cellSize);
            ctx.lineTo(lx + gx + 2, ly + cellSize - bladeH);
            ctx.stroke();
          }
          break;
        }
      }
    }

    // Road lane markings — dashed yellow center lines
    ctx.setLineDash([cellSize * 0.4, cellSize * 0.3]);
    ctx.strokeStyle = COLORS.laneMarking;
    ctx.lineWidth = 2;
    for (let row = 8; row <= 11; row++) {
      const y = offsetY + row * cellSize;
      ctx.beginPath();
      ctx.moveTo(offsetX, y);
      ctx.lineTo(offsetX + W, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Sidewalk borders on road edges
    ctx.fillStyle = COLORS.sidewalk;
    ctx.fillRect(offsetX, offsetY + 7 * cellSize - 3, W, 3);
    ctx.fillRect(offsetX, offsetY + 12 * cellSize, W, 3);
  }

  // ── Goal Slots ──────────────────────────────────────────
  drawGoalSlots(goalSlots: GoalSlot[]): void {
    const { ctx, cellSize, offsetX, offsetY, frameCount } = this;
    for (const slot of goalSlots) {
      const x = offsetX + slot.x * cellSize;
      const y = offsetY;
      const cx = x + cellSize / 2;
      const cy = y + cellSize / 2;
      const r = cellSize * 0.38;

      if (slot.filled) {
        // Glowing filled slot
        const glow = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 1.5);
        glow.addColorStop(0, COLORS.goalFilled);
        glow.addColorStop(0.6, COLORS.goalFilledGlow);
        glow.addColorStop(1, 'rgba(255,215,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x - cellSize * 0.2, y - cellSize * 0.2, cellSize * 1.4, cellSize * 1.4);

        ctx.fillStyle = COLORS.goalFilled;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${cellSize * 0.4}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', cx, cy);
      } else {
        // Empty slot — pulsing lily pad
        const pulse = 1 + Math.sin(frameCount * 0.04) * 0.05;
        ctx.fillStyle = COLORS.goalPad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * pulse, r * 0.85 * pulse, 0, 0, Math.PI * 2);
        ctx.fill();
        // Vein
        ctx.strokeStyle = COLORS.goalPadGlow;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 0.6);
        ctx.lineTo(cx, cy + r * 0.6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.4, cy - r * 0.2);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx - r * 0.4, cy + r * 0.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.4, cy - r * 0.2);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + r * 0.4, cy + r * 0.2);
        ctx.stroke();
      }
    }
  }

  // ── Vehicles ────────────────────────────────────────────
  drawVehicles(vehicles: Vehicle[]): void {
    const { ctx, cellSize, offsetX, offsetY } = this;
    for (const v of vehicles) {
      const x = offsetX + v.x * cellSize;
      const y = offsetY + v.y * cellSize;
      const w = v.width * cellSize;
      const h = cellSize * 0.78;
      const yOff = cellSize * 0.11;
      const r = cellSize * 0.15;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      this.roundRect(x + 3, y + yOff + 3, w, h, r);

      // Body
      const bodyGrad = ctx.createLinearGradient(x, y + yOff, x, y + yOff + h);
      bodyGrad.addColorStop(0, this.lightenColor(v.color, 20));
      bodyGrad.addColorStop(0.5, v.color);
      bodyGrad.addColorStop(1, this.darkenColor(v.color, 30));
      ctx.fillStyle = bodyGrad;
      this.roundRect(x, y + yOff, w, h, r);

      // Roof highlight
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(x + r, y + yOff + 2, w - r * 2, h * 0.25);

      // Windshield
      if (v.width <= 1.2) {
        ctx.fillStyle = 'rgba(135,206,250,0.7)';
        const wsW = w * 0.22;
        const wsH = h * 0.55;
        const wsX = v.direction === 1 ? x + w * 0.62 : x + w * 0.12;
        const wsY = y + yOff + h * 0.18;
        ctx.fillRect(wsX, wsY, wsW, wsH);
        // Window frame
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(wsX, wsY, wsW, wsH);
      } else {
        // Truck: cargo area
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        const cargoX = v.direction === 1 ? x + cellSize * 0.15 : x + w - w * 0.6;
        ctx.fillRect(cargoX, y + yOff + h * 0.1, w * 0.5, h * 0.8);
      }

      // Headlights
      const hlSize = cellSize * 0.07;
      ctx.fillStyle = v.direction === 1 ? 'rgba(255,255,200,0.9)' : 'rgba(255,50,50,0.7)';
      const frontX = v.direction === 1 ? x + w - hlSize - 2 : x + 2;
      ctx.beginPath();
      ctx.arc(frontX + hlSize / 2, y + yOff + h * 0.25, hlSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(frontX + hlSize / 2, y + yOff + h * 0.75, hlSize, 0, Math.PI * 2);
      ctx.fill();

      // Tail lights
      ctx.fillStyle = v.direction === 1 ? 'rgba(255,50,50,0.7)' : 'rgba(255,255,200,0.9)';
      const backX = v.direction === 1 ? x + 2 : x + w - hlSize - 2;
      ctx.beginPath();
      ctx.arc(backX + hlSize / 2, y + yOff + h * 0.25, hlSize * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(backX + hlSize / 2, y + yOff + h * 0.75, hlSize * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Logs ────────────────────────────────────────────────
  drawLogs(logs: Log[]): void {
    const { ctx, cellSize, offsetX, offsetY } = this;
    for (const log of logs) {
      const x = offsetX + log.x * cellSize;
      const y = offsetY + log.y * cellSize;
      const w = log.width * cellSize;
      const h = cellSize * 0.78;
      const yOff = cellSize * 0.11;
      const r = cellSize * 0.22;

      // Water shadow underneath
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      this.roundRect(x + 2, y + yOff + 3, w, h, r);

      // Main bark
      const barkGrad = ctx.createLinearGradient(x, y + yOff, x, y + yOff + h);
      barkGrad.addColorStop(0, COLORS.logLight);
      barkGrad.addColorStop(0.3, COLORS.log);
      barkGrad.addColorStop(0.7, COLORS.logBark);
      barkGrad.addColorStop(1, COLORS.log);
      ctx.fillStyle = barkGrad;
      this.roundRect(x, y + yOff, w, h, r);

      // End circles (cross-section)
      ctx.fillStyle = COLORS.logBark;
      ctx.beginPath();
      ctx.ellipse(x + r * 0.5, y + yOff + h / 2, r * 0.5, h * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + w - r * 0.5, y + yOff + h / 2, r * 0.5, h * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      // Rings
      ctx.strokeStyle = 'rgba(160,120,60,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x + r * 0.5, y + yOff + h / 2, r * 0.25, h * 0.2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x + w - r * 0.5, y + yOff + h / 2, r * 0.25, h * 0.2, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Bark lines
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1;
      for (let i = 1; i < log.width; i++) {
        const lx = x + i * cellSize;
        ctx.beginPath();
        ctx.moveTo(lx, y + yOff + 3);
        ctx.lineTo(lx, y + yOff + h - 3);
        ctx.stroke();
      }

      // Top highlight
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(x + r, y + yOff + 1, w - r * 2, h * 0.2);
    }
  }

  // ── Turtles (Lily Pads) ────────────────────────────────
  drawTurtles(turtles: Turtle[]): void {
    const { ctx, cellSize, offsetX, offsetY, frameCount } = this;
    for (const turtle of turtles) {
      const baseX = offsetX + turtle.x * cellSize;
      const y = offsetY + turtle.y * cellSize;

      for (let i = 0; i < turtle.width; i++) {
        const cx = baseX + (i + 0.5) * cellSize;
        const cy = y + cellSize * 0.5;
        const r = cellSize * 0.38;

        if (turtle.submerged) {
          // Submerged ripples
          const ripplePhase = (frameCount * 0.05 + i) % 1;
          ctx.strokeStyle = `rgba(255,255,255,${0.3 - ripplePhase * 0.25})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(cx, cy, r * (0.5 + ripplePhase * 0.5), r * (0.2 + ripplePhase * 0.15), 0, 0, Math.PI * 2);
          ctx.stroke();
          // Inner ripple
          ctx.strokeStyle = `rgba(255,255,255,${0.15})`;
          ctx.beginPath();
          ctx.ellipse(cx, cy, r * 0.3, r * 0.12, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Shadow in water
          ctx.fillStyle = 'rgba(0,0,0,0.15)';
          ctx.beginPath();
          ctx.ellipse(cx + 2, cy + 2, r, r * 0.85, 0, 0, Math.PI * 2);
          ctx.fill();

          // Shell body — gradient
          const shellGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
          shellGrad.addColorStop(0, COLORS.turtleLight);
          shellGrad.addColorStop(1, COLORS.turtle);
          ctx.fillStyle = shellGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();

          // Shell outline
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();

          // Shell hex pattern
          ctx.strokeStyle = 'rgba(0,80,0,0.25)';
          ctx.lineWidth = 1;
          const innerR = r * 0.55;
          ctx.beginPath();
          ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
          ctx.stroke();
          // Radial lines from center to edge
          for (let a = 0; a < 6; a++) {
            const angle = (a / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * innerR * 0.3, cy + Math.sin(angle) * innerR * 0.3);
            ctx.lineTo(cx + Math.cos(angle) * r * 0.85, cy + Math.sin(angle) * r * 0.85);
            ctx.stroke();
          }

          // Highlight
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.beginPath();
          ctx.ellipse(cx - r * 0.15, cy - r * 0.2, r * 0.45, r * 0.25, -0.3, 0, Math.PI * 2);
          ctx.fill();

          // Head
          const headAngle = turtle.direction === -1 ? Math.PI : 0;
          const headX = cx + Math.cos(headAngle) * r * 1.0;
          const headY = cy + Math.sin(headAngle) * r * 0.1;
          ctx.fillStyle = '#3a6b35';
          ctx.beginPath();
          ctx.arc(headX, headY, r * 0.22, 0, Math.PI * 2);
          ctx.fill();
          // Eye
          ctx.fillStyle = '#111';
          const eyeOff = turtle.direction === -1 ? -r * 0.08 : r * 0.08;
          ctx.beginPath();
          ctx.arc(headX + eyeOff, headY - r * 0.08, r * 0.05, 0, Math.PI * 2);
          ctx.fill();

          // Legs (small)
          ctx.fillStyle = '#3a6b35';
          const legPositions = [
            { ax: -0.7, ay: -0.6 }, { ax: -0.7, ay: 0.6 },
            { ax: 0.7, ay: -0.6 }, { ax: 0.7, ay: 0.6 },
          ];
          for (const lp of legPositions) {
            ctx.beginPath();
            ctx.ellipse(cx + lp.ax * r, cy + lp.ay * r, r * 0.15, r * 0.1, lp.ax < 0 ? -0.4 : 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  }

  // ── Player ──────────────────────────────────────────────
  drawPlayer(player: Player): void {
    const { ctx, cellSize, offsetX, offsetY } = this;
    const pos = player.getRenderPosition();
    const x = offsetX + pos.x * cellSize;
    const y = offsetY + pos.y * cellSize;
    const size = cellSize * 0.88;
    const cx = x + cellSize / 2;
    const cy = y + cellSize / 2;
    const radius = size / 2;

    if (player.isDying()) {
      const deathProgress = player.getDeathProgress();
      const scale = 1 - deathProgress * 0.8;
      const rotation = deathProgress * Math.PI * 3;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);
      ctx.globalAlpha = 1 - deathProgress;

      // Flash red
      ctx.fillStyle = `rgba(255,0,0,${0.6 - deathProgress * 0.4})`;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
      ctx.fill();

      // Still show sprite during death
      const spriteCanvas = this.sprite.getScaled(Math.ceil(size));
      if (spriteCanvas) {
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(spriteCanvas, -radius, -radius, size, size);
      }

      ctx.restore();
      return;
    }

    // Outer glow
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.4);
    glow.addColorStop(0, 'rgba(255,255,255,0.15)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx + 2, cy + 3, radius * 0.85, radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // White border ring
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Player sprite
    const spriteCanvas = this.sprite.getScaled(Math.ceil(size));
    if (spriteCanvas) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(spriteCanvas, cx - radius, cy - radius, size, size);
      ctx.restore();
    } else {
      ctx.fillStyle = '#FFD93D';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Helpers ─────────────────────────────────────────────
  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  private lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + percent);
    const g = Math.min(255, ((num >> 8) & 0xff) + percent);
    const b = Math.min(255, (num & 0xff) + percent);
    return `rgb(${r},${g},${b})`;
  }

  private darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - percent);
    const g = Math.max(0, ((num >> 8) & 0xff) - percent);
    const b = Math.max(0, (num & 0xff) - percent);
    return `rgb(${r},${g},${b})`;
  }

  // ── Main Render ─────────────────────────────────────────
  render(
    player: Player,
    vehicles: Vehicle[],
    logs: Log[],
    turtles: Turtle[],
    goalSlots: GoalSlot[],
  ): void {
    this.frameCount++;
    this.clear();
    this.drawBackground();
    this.drawGoalSlots(goalSlots);
    this.drawLogs(logs);
    this.drawTurtles(turtles);
    this.drawVehicles(vehicles);
    this.drawPlayer(player);
  }
}
