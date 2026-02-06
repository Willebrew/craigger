import { Player } from '../entities/Player';
import { Vehicle } from '../entities/Vehicle';
import { Log } from '../entities/Log';
import { Turtle } from '../entities/Turtle';
import { GoalSlot } from '../types';
import { LANE_CONFIGS, GOAL_SLOTS } from '../constants';

function aabbOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export class CollisionSystem {
  checkVehicleCollision(player: Player, vehicles: Vehicle[]): boolean {
    const pos = player.getGridPosition();
    const px = pos.x + 0.15;
    const py = pos.y + 0.15;
    const pw = 0.7;
    const ph = 0.7;

    for (const v of vehicles) {
      const hb = v.getHitbox();
      if (aabbOverlap(px, py, pw, ph, hb.x, hb.y, hb.w, hb.h)) {
        return true;
      }
    }
    return false;
  }

  // Returns the platform entity the player is on, or null if drowning
  // Returns raw speed/direction so the caller can apply drift with actual dt
  checkWaterCollision(
    player: Player,
    logs: Log[],
    turtles: Turtle[],
  ): { onPlatform: boolean; platformSpeed: number; platformDirection: 1 | -1 | 0 } {
    const pos = player.getGridPosition();
    const row = pos.y;

    // Only check water rows
    const laneConfig = LANE_CONFIGS.find(l => l.row === row);
    if (!laneConfig || laneConfig.type !== 'water') {
      return { onPlatform: true, platformSpeed: 0, platformDirection: 0 }; // Not on water
    }

    const px = player.x + 0.2;
    const py = pos.y + 0.2;
    const pw = 0.6;
    const ph = 0.6;

    // Check logs
    for (const log of logs) {
      const hb = log.getHitbox();
      if (hb.y === row && aabbOverlap(px, py, pw, ph, hb.x, hb.y, hb.w, hb.h)) {
        return { onPlatform: true, platformSpeed: log.speed, platformDirection: log.direction };
      }
    }

    // Check turtles (only if not submerged)
    for (const turtle of turtles) {
      const hb = turtle.getHitbox();
      if (hb.y === row && !turtle.submerged && aabbOverlap(px, py, pw, ph, hb.x, hb.y, hb.w, hb.h)) {
        return { onPlatform: true, platformSpeed: turtle.speed, platformDirection: turtle.direction };
      }
    }

    // On water with no platform = drowning
    return { onPlatform: false, platformSpeed: 0, platformDirection: 0 };
  }

  checkGoalSlot(player: Player, goalSlots: GoalSlot[]): number {
    const pos = player.getGridPosition();
    if (pos.y !== 0) return -1;

    for (let i = 0; i < goalSlots.length; i++) {
      const slot = goalSlots[i];
      if (!slot.filled && Math.abs(pos.x - slot.x) <= 0.8) {
        return i;
      }
    }
    return -1; // Missed goal pad or already filled
  }

  isPlayerOutOfBounds(player: Player): boolean {
    const pos = player.getGridPosition();
    return player.x < -0.5 || player.x >= 15.5;
  }
}
