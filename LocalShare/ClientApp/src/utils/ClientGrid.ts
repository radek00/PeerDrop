export enum AnimationState {
  IDLE,
  ACTIVE,
}

export class ClientGrid {
  private readonly MIN_CIRCLES = 5;
  private readonly MAX_CIRCLES = 12;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private circleCount = 0;
  private dimensions = { width: 0, height: 0 };
  private center = { x: 0, y: 0 };
  private circleSpacing = 0;
  private animationFrame: number | null = null;
  private step = 0;
  state = AnimationState.IDLE;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.setupCanvas();
    this.ctx = this.canvas.getContext("2d")!;
    window.addEventListener("resize", this.handleResize);
    this.init();
  }

  private setupCanvas(): void {
    this.canvas.style.width = "100%";
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.zIndex = "-1";
    document.body.appendChild(this.canvas);
  }

  private handleResize = (): void => {
    this.init();
  };

  private init(): void {
    this.dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.canvas.width = this.dimensions.width;
    this.canvas.height = this.dimensions.height;

    const offset = this.dimensions.height > 800 ? 116 : 100;
    this.center = {
      x: this.dimensions.width / 2,
      y: this.dimensions.height - offset,
    };

    const baseCircleCount = Math.floor(this.dimensions.height / 200);
    this.circleCount = Math.min(
      Math.max(baseCircleCount, this.MIN_CIRCLES),
      this.MAX_CIRCLES
    );

    this.circleSpacing = this.dimensions.height / (this.circleCount + 1);
  }

  private drawCircle(radius: number): void {
    this.ctx.beginPath();
    const intensity = Math.round(
      197 *
        (1 - radius / Math.max(this.dimensions.width, this.dimensions.height))
    );

    this.ctx.strokeStyle =
      this.state === AnimationState.IDLE
        ? `rgba(${intensity},${intensity},${intensity},0.2)`
        : `rgba(45,${intensity},191,0.3)`;

    this.ctx.lineWidth = 2;
    this.ctx.arc(this.center.x, this.center.y, radius, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  private render = (): void => {
    this.ctx.clearRect(0, 0, this.dimensions.width, this.dimensions.height);
    for (let i = 0; i < 8; i++) {
      this.drawCircle(
        this.circleSpacing * i + (this.step % this.circleSpacing)
      );
    }
    this.step++;
    this.animationFrame = requestAnimationFrame(this.render);
  };

  public start(): void {
    if (this.animationFrame === null) {
      this.render();
    }
  }

  public stop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  public toggleState(): void {
    this.state =
      this.state === AnimationState.IDLE
        ? AnimationState.ACTIVE
        : AnimationState.IDLE;
  }

  public cleanup(): void {
    this.stop();
    window.removeEventListener("resize", this.handleResize);
    this.canvas.remove();
  }
}
