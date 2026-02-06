export class SpriteSheet {
  private image: HTMLImageElement | null = null;
  private loaded = false;
  private scaledCache: Map<number, HTMLCanvasElement> = new Map();

  load(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.image = img;
        this.loaded = true;
        resolve();
      };
      img.onerror = () => {
        // Fallback: create a colored circle as placeholder
        this.createFallback();
        resolve();
      };
      img.src = src;
    });
  }

  private createFallback(): void {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Draw a friendly face as placeholder
    ctx.fillStyle = '#FFD93D';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(size * 0.35, size * 0.4, size * 0.06, 0, Math.PI * 2);
    ctx.arc(size * 0.65, size * 0.4, size * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(size / 2, size * 0.5, size * 0.2, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    const img = new Image();
    img.src = canvas.toDataURL();
    this.image = img;
    this.loaded = true;
  }

  getScaled(size: number): HTMLCanvasElement | null {
    if (!this.loaded || !this.image) return null;

    const key = Math.round(size);
    if (this.scaledCache.has(key)) {
      return this.scaledCache.get(key)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = key;
    canvas.height = key;
    const ctx = canvas.getContext('2d')!;

    // Draw circular clipped image
    ctx.beginPath();
    ctx.arc(key / 2, key / 2, key / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(this.image, 0, 0, key, key);

    this.scaledCache.set(key, canvas);
    return canvas;
  }

  clearCache(): void {
    this.scaledCache.clear();
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}
