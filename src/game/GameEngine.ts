import { GameState, GameCallbacks, GoalSlot } from './types';
import { GAME_CONFIG, GOAL_SLOTS, SCORING } from './constants';
import { Player } from './entities/Player';
import { Renderer } from './rendering/Renderer';
import { SpriteSheet } from './rendering/SpriteSheet';
import { InputManager } from './input/InputManager';
import { CollisionSystem } from './systems/CollisionSystem';
import { LaneManager } from './systems/LaneManager';
import { LevelManager } from './systems/LevelManager';
import { AudioManager } from './audio/AudioManager';

const HIGH_SCORE_KEY = 'craigger-highscore';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: Renderer;
  private sprite: SpriteSheet;
  private input: InputManager;
  private collision: CollisionSystem;
  private laneManager: LaneManager;
  private levelManager: LevelManager;
  private audio: AudioManager;
  private player: Player;

  private state: GameState = 'menu';
  private score = 0;
  private lives = GAME_CONFIG.lives;
  private highScore = 0;
  private goalSlots: GoalSlot[] = [];
  private callbacks: GameCallbacks;

  private animFrameId = 0;
  private lastTime = 0;
  private levelCompleteTimer = 0;
  private readonly levelCompleteDuration = 2000;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.callbacks = callbacks;

    this.sprite = new SpriteSheet();
    this.renderer = new Renderer(this.ctx, this.sprite);
    this.input = new InputManager(GAME_CONFIG.hopCooldown);
    this.collision = new CollisionSystem();
    this.laneManager = new LaneManager();
    this.levelManager = new LevelManager();
    this.audio = new AudioManager();
    this.player = new Player();

    this.goalSlots = GOAL_SLOTS.map(x => ({ x, filled: false }));

    // Load high score
    try {
      const saved = localStorage.getItem(HIGH_SCORE_KEY);
      if (saved) this.highScore = parseInt(saved, 10) || 0;
    } catch {}

    this.callbacks.onHighScoreChange(this.highScore);
  }

  async init(): Promise<void> {
    await this.sprite.load('/craig.png');
    this.input.attach(this.canvas);
    this.laneManager.init();
    this.handleResize();
  }

  handleResize(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.renderer.resize(rect.width, rect.height, dpr);

    // Re-render current frame
    this.renderFrame();
  }

  start(): void {
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
    }
    this.input.detach();
  }

  startGame(): void {
    this.audio.init();
    this.setState('playing');
    this.score = 0;
    this.lives = GAME_CONFIG.lives;
    this.levelManager.reset();
    this.player.reset();
    this.goalSlots = GOAL_SLOTS.map(x => ({ x, filled: false }));
    this.laneManager.init();
    this.input.setEnabled(true);

    this.callbacks.onScoreChange(this.score);
    this.callbacks.onLivesChange(this.lives);
    this.callbacks.onLevelChange(this.levelManager.level);
  }

  restartGame(): void {
    this.startGame();
  }

  getState(): GameState {
    return this.state;
  }

  getInput(): InputManager {
    return this.input;
  }

  private setState(state: GameState): void {
    this.state = state;
    this.callbacks.onStateChange(state);
  }

  private loop = (time: number): void => {
    const rawDt = time - this.lastTime;
    const dt = Math.min(rawDt, GAME_CONFIG.maxDeltaTime);
    this.lastTime = time;

    this.update(dt);
    this.renderFrame();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number): void {
    if (this.state === 'menu' || this.state === 'gameover') {
      // Check for action to start/restart
      if (this.input.consumeAction()) {
        if (this.state === 'menu') {
          this.startGame();
        } else {
          this.restartGame();
        }
      }
      return;
    }

    if (this.state === 'levelcomplete') {
      this.levelCompleteTimer += dt;
      if (this.levelCompleteTimer >= this.levelCompleteDuration) {
        this.nextLevel();
      }
      return;
    }

    if (this.state === 'dying') {
      this.player.update(dt);
      this.laneManager.update(dt, this.levelManager.getSpeedMultiplier());
      if (this.player.isDeathComplete()) {
        this.lives--;
        this.callbacks.onLivesChange(this.lives);
        if (this.lives <= 0) {
          this.gameOver();
        } else {
          this.player.resetPosition();
          this.setState('playing');
          this.input.setEnabled(true);
        }
      }
      return;
    }

    // Playing state
    const dir = this.input.consumeDirection();
    if (dir) {
      const hopped = this.player.hop(dir);
      if (hopped) {
        this.audio.playHop();
      }
    }

    const speedMult = this.levelManager.getSpeedMultiplier();

    // Check water platform BEFORE updating positions so we can set drift
    // This ensures player moves in lockstep with the platform this frame
    if (!this.player.isMoving()) {
      const waterResult = this.collision.checkWaterCollision(
        this.player, this.laneManager.logs, this.laneManager.turtles,
      );
      if (!waterResult.onPlatform) {
        this.audio.playSplash();
        this.killPlayer();
        // Still update entities so they keep moving during death
        this.laneManager.update(dt, speedMult);
        this.player.update(dt);
        return;
      }
      if (waterResult.platformSpeed !== 0) {
        this.player.applyDrift(waterResult.platformSpeed, waterResult.platformDirection, speedMult);
      } else {
        this.player.clearDrift();
      }
    }

    // Update entities and player together - drift uses same dt as platform movement
    this.laneManager.update(dt, speedMult);
    this.player.update(dt);

    // Skip collision checks during hop interpolation
    if (this.player.isMoving()) return;

    // Check forward progress for score
    if (this.player.checkForwardProgress()) {
      this.addScore(SCORING.stepForward);
    }

    // Goal check
    const goalIdx = this.collision.checkGoalSlot(this.player, this.goalSlots);
    if (goalIdx >= 0) {
      this.goalSlots[goalIdx].filled = true;
      this.addScore(SCORING.goalSlot);
      this.audio.playScore();
      this.player.resetPosition();
      this.player.resetForwardProgress();

      // Check if all goals filled
      if (this.goalSlots.every(g => g.filled)) {
        this.addScore(SCORING.levelComplete);
        this.audio.playLevelUp();
        this.levelCompleteTimer = 0;
        this.setState('levelcomplete');
        this.input.setEnabled(false);
        return;
      }
      return;
    }

    // If player is at row 0 but missed a goal pad
    if (this.player.getGridPosition().y === 0 && goalIdx === -1) {
      this.killPlayer();
      return;
    }

    // Vehicle collision (road rows)
    if (this.collision.checkVehicleCollision(this.player, this.laneManager.vehicles)) {
      this.killPlayer();
      return;
    }

    // Out of bounds check (drifted off screen)
    if (this.collision.isPlayerOutOfBounds(this.player)) {
      this.killPlayer();
      return;
    }
  }

  private renderFrame(): void {
    this.renderer.render(
      this.player,
      this.laneManager.vehicles,
      this.laneManager.logs,
      this.laneManager.turtles,
      this.goalSlots,
    );
  }

  private killPlayer(): void {
    this.player.die();
    this.audio.playDie();
    this.setState('dying');
    this.input.setEnabled(false);
  }

  private addScore(points: number): void {
    this.score += points;
    this.callbacks.onScoreChange(this.score);

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.callbacks.onHighScoreChange(this.highScore);
      try {
        localStorage.setItem(HIGH_SCORE_KEY, String(this.highScore));
      } catch {}
    }
  }

  private gameOver(): void {
    this.setState('gameover');
    this.input.setEnabled(false);
  }

  private nextLevel(): void {
    this.levelManager.nextLevel();
    this.callbacks.onLevelChange(this.levelManager.level);
    this.goalSlots = GOAL_SLOTS.map(x => ({ x, filled: false }));
    this.laneManager.init();
    this.laneManager.adjustForLevel(this.levelManager.level);
    this.player.resetPosition();
    this.player.resetForwardProgress();
    this.setState('playing');
    this.input.setEnabled(true);
  }
}
