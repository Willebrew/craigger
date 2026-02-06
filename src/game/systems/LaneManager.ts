import { LaneConfig } from '../types';
import { GAME_CONFIG, LANE_CONFIGS, COLORS } from '../constants';
import { Vehicle } from '../entities/Vehicle';
import { Log } from '../entities/Log';
import { Turtle } from '../entities/Turtle';

export class LaneManager {
  vehicles: Vehicle[] = [];
  logs: Log[] = [];
  turtles: Turtle[] = [];

  init(): void {
    this.vehicles = [];
    this.logs = [];
    this.turtles = [];

    for (const lane of LANE_CONFIGS) {
      if (lane.type === 'road' && lane.entityType && lane.count) {
        this.spawnVehiclesForLane(lane);
      } else if (lane.type === 'water' && lane.entityType && lane.count) {
        if (lane.entityType === 'log') {
          this.spawnLogsForLane(lane);
        } else if (lane.entityType === 'turtle') {
          this.spawnTurtlesForLane(lane);
        }
      }
    }
  }

  private spawnVehiclesForLane(lane: LaneConfig): void {
    const count = lane.count!;
    const spacing = GAME_CONFIG.cols / count;
    const width = lane.entityWidth || 1;

    for (let i = 0; i < count; i++) {
      const x = i * spacing + Math.random() * (spacing - width);
      this.vehicles.push(new Vehicle(
        x, lane.row, width, lane.speed!, lane.direction!, lane.color!,
      ));
    }
  }

  private spawnLogsForLane(lane: LaneConfig): void {
    const count = lane.count!;
    const spacing = GAME_CONFIG.cols / count;
    const width = lane.entityWidth || 3;

    for (let i = 0; i < count; i++) {
      const x = i * spacing;
      this.logs.push(new Log(
        x, lane.row, width, lane.speed!, lane.direction!, lane.color!,
      ));
    }
  }

  private spawnTurtlesForLane(lane: LaneConfig): void {
    const count = lane.count!;
    const spacing = GAME_CONFIG.cols / count;
    const width = lane.entityWidth || 3;

    for (let i = 0; i < count; i++) {
      const x = i * spacing;
      this.turtles.push(new Turtle(
        x, lane.row, width, lane.speed!, lane.direction!, lane.color!,
      ));
    }
  }

  update(dt: number, speedMultiplier: number): void {
    for (const v of this.vehicles) {
      v.update(dt, speedMultiplier);
    }
    for (const log of this.logs) {
      log.update(dt, speedMultiplier);
    }
    for (const turtle of this.turtles) {
      turtle.update(dt, speedMultiplier);
    }
  }

  // Difficulty adjustments
  adjustForLevel(level: number): void {
    // Level 3+: turtles dive more frequently
    if (level >= 3) {
      for (const turtle of this.turtles) {
        turtle.surfaceDuration = Math.max(1500, 3000 - (level - 3) * 300);
      }
    }

    // Level 5+: shorter logs
    if (level >= 5) {
      for (const log of this.logs) {
        if (log.width > 2) {
          log.width = Math.max(2, log.width - 0.5);
        }
      }
    }

    // Level 7+: faster dive cycles
    if (level >= 7) {
      for (const turtle of this.turtles) {
        turtle.diveDuration = Math.min(1500, 1000 + (level - 7) * 100);
      }
    }
  }
}
