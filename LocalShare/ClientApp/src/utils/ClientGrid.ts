enum AnimationState {
    ANIMATING,
    PULSATING
}

export class ClientGrid {
    private canvas: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D;
    private height: number;
    private width: number;
    private x0: number;
    private y0: number;
    private dw: number;
    private step: number = 0;
    private isAnimating: boolean = true;
    private pulsateStep: number = 0;

    private transitionStep: number = 0;
    private transitionDuration: number = 120; 

    private circles: { x: number, y: number, radius: number, color: string }[] = [];

    private state: AnimationState = AnimationState.ANIMATING;


    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = "100%";
        this.canvas.style.zIndex = "-1";
        this.canvas.style.position = "absolute";
        this.canvas.style.top = "0";
        this.canvas.style.left = "0";

        document.body.appendChild(this.canvas);
        this.canvasContext = this.canvas.getContext('2d')!;
        this.height = 0;
        this.width = 0;
        this.x0 = 0;
        this.y0 = 0;
        this.dw = 0;

        window.addEventListener('resize', () => this.init());
    }

    private init() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        let offset = this.height /2;
        // let offset = this.height > 380 ? 100 : 65;
        // offset = this.height > 800 ? 116 : offset;
        this.x0 = this.width / 2;
        this.y0 = this.height - offset;
        this.dw = Math.max(this.width, this.height, 1000) / 13;
        this.drawCircles();
    }

    
    private drawCircle(radius: number) {
        this.canvasContext.beginPath();
        let color = Math.round(197 * (1 - radius / Math.max(this.width, this.height)));
        this.canvasContext.strokeStyle = 'rgba(' + color + ',' + color + ',' + color + ',0.1)';
        this.canvasContext.arc(this.x0, this.y0, radius, 0, 2 * Math.PI);
        this.canvasContext.stroke();
        this.canvasContext.lineWidth = 2;
        this.circles.push({ x: this.x0, y: this.y0, radius: radius, color: 'rgba(' + color + ',' + color + ',' + color + ',0.1)' });
    }

    private drawCircles() {
        console.log("Drawing Circles", this.circles);
        this.circles = [];
        this.canvasContext.clearRect(0, 0, this.width, this.height);
        for (let i = 0; i < 8; i++) {
            this.drawCircle(this.dw * i + this.step % this.dw);
        }
        this.step += 1;
    }

    public renderCanvas() {
        this.init();
        this.animate();
    }
    private getRandomPointOnCirclePerimeter(circle: { x: number, y: number, radius: number }): { x: number, y: number } {
        const angle = Math.random() * 2 * Math.PI;
        const x = circle.x + circle.radius * Math.cos(angle);
        const y = circle.y + circle.radius * Math.sin(angle);
        return { x, y };
    }

    private redrawCircles() {
        this.canvasContext.clearRect(0, 0, this.width, this.height);
        for (const circle of this.circles) {
            this.canvasContext.beginPath();
            this.canvasContext.strokeStyle = circle.color;
            this.canvasContext.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
            this.canvasContext.stroke();
            this.canvasContext.lineWidth = 4;
        }
    }

    private animate() {
        if (this.state === AnimationState.ANIMATING) {
            requestAnimationFrame(() => {
                this.drawCircles();
                this.animate();
            });
        }
    }

    
    private pulsate() {
        if (this.state === AnimationState.PULSATING) {
            requestAnimationFrame(() => {
                this.pulsateStep += 0.025;
                const alpha = 0.5 + 0.5 * (Math.sin(this.pulsateStep) + 1) / 2; // Value between 0.5 and 1
                for (let i = 0; i < this.circles.length; i++) {
                    this.circles[i].color = `rgba(52, 129, 94, ${alpha})`; // Green color with varying alpha
                }
                this.redrawCircles();
                this.pulsate();
            });
        }
    }

    private transition() {
        console.log(this.circles.length);
        if (this.transitionStep < this.transitionDuration) {
            requestAnimationFrame(() => {
                this.transitionStep++;
                const progress = this.transitionStep / this.transitionDuration;
                const alpha = 0.5 + 0.5 * (Math.sin(this.pulsateStep) + 1) / 2; // Value between 0.5 and 1
                for (let i = 0; i < this.circles.length; i++) {
                    const currentColor = this.circles[i].color;
                    const targetColor = `rgba(52, 129, 94, ${alpha})`;
                    this.circles[i].color = this.interpolateColor(currentColor, targetColor, progress);
                }
                this.redrawCircles();
                this.transition();
            });
        } else {
            this.transitionStep = 0;
            this.state = AnimationState.PULSATING;
            this.pulsate();
        }
    }

    public getNextClientPosition() {
        const elementIndex = Math.min(Math.max(0, Math.floor(Math.random() * 3)), this.circles.length - 1);
        const circle = this.circles[elementIndex];
        return this.getRandomPointOnCirclePerimeter(circle);
    }
    public changeStage() {
        if (this.state === AnimationState.ANIMATING) {
            this.circles.shift();
            this.state = AnimationState.PULSATING;
            this.transition();
        } else {
            this.state = AnimationState.ANIMATING;
            this.animate();
        }
    }

    private interpolateColor(currentColor: string, targetColor: string, progress: number): string {
        const currentRGBA = this.parseRGBA(currentColor);
        const targetRGBA = this.parseRGBA(targetColor);
        const interpolatedRGBA = currentRGBA.map((current, index) => {
            return current + (targetRGBA[index] - current) * progress;
        });
        return `rgba(${interpolatedRGBA[0]}, ${interpolatedRGBA[1]}, ${interpolatedRGBA[2]}, ${interpolatedRGBA[3]})`;
    }
    
    private parseRGBA(color: string): number[] {
        const rgba = color.match(/\d+(\.\d+)?/g)?.map(Number) || [0, 0, 0, 1];
        return rgba;
    }
    
}