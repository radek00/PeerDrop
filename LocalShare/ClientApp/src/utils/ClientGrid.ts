export class ClientGrid {
    private canvas: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D;
    private height: number;
    private width: number;
    private x0: number;
    private y0: number;
    private dw: number;
    private step: number = 0;
    private isLoading: boolean = false;


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

        let offset = this.height / 2;
        // offset = this.height > 800 ? 116 : offset;
        this.x0 = this.width / 2;
        this.y0 = this.height - offset;
        this.dw = Math.max(this.width, this.height, 1000) / 8;
        this.drawCircles();
    }

    
    private drawCircle(radius: number) {
        this.canvasContext.beginPath();
        let color = Math.round(197 * (1 - radius / Math.max(this.width, this.height)));
        this.canvasContext.strokeStyle = 'rgba(' + color + ',' + color + ',' + color + ',0.1)';
        this.canvasContext.arc(this.x0, this.y0, radius, 0, 2 * Math.PI);
        this.canvasContext.stroke();
        this.canvasContext.lineWidth = 2;
    }

    private drawCircles() {
        this.canvasContext.clearRect(0, 0, this.width, this.height);
        for (let i = 0; i < 8; i++) {
            this.drawCircle(this.dw * i + this.step % this.dw);
        }
        this.step += 1;
    }

    public renderCanvas() {
        const animate = () => {
            requestAnimationFrame(() => {
                this.drawCircles();
                animate();
            });
            // if (this.isLoading || this.step % this.dw < this.dw - 5) {
            // }
        }
        // window.animateBackground = (l) => {
        //     this.isLoading = l;
        //     animate();
        // };
        this.init();
        animate();
    }
}