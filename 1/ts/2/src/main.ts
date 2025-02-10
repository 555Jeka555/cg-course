class CanvasApp {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private kyle: Kyle;
    private isDragging: boolean = false;
    private offsetX: number = 0;
    private offsetY: number = 0;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.canvas) throw new Error("Canvas not found");

        this.ctx = this.canvas.getContext("2d")!;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        const initialX = this.canvas.width / 2.5;
        const initialY = this.canvas.height / 2.5;
        this.kyle = new Kyle(this.ctx, initialX, initialY);

        this.kyle.draw();
        this.addEventListeners();
    }

    private addEventListeners() {
        this.canvas.addEventListener("mousedown", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const bounds = this.kyle.getBounds();
            if (mouseX >= bounds.left && mouseX <= bounds.right && mouseY >= bounds.top && mouseY <= bounds.bottom) {
                this.isDragging = true;
                this.offsetX = mouseX - this.kyle.getX();
                this.offsetY = mouseY - this.kyle.getY();
            }
        });

        this.canvas.addEventListener("mousemove", (e) => {
            if (this.isDragging) {
                const rect = this.canvas.getBoundingClientRect();
                const newX = e.clientX - rect.left - this.offsetX;
                const newY = e.clientY - rect.top - this.offsetY;
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.kyle.setPosition(newX, newY);
                this.kyle.draw();
            }
        });

        this.canvas.addEventListener("mouseup", () => {
            this.isDragging = false;
        });
    }
}

class Kyle {
    private ctx: CanvasRenderingContext2D;
    private x: number;
    private y: number;

    constructor(ctx: CanvasRenderingContext2D, x: number, y: number) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
    }

    public draw() {
        this.drawLegs();
        this.drawJacket();
        this.drawFace();
        this.drawEyes();
        this.drawMouth();
        this.drawGloves();
        this.drawHat();
    }

    private drawHat() {
        this.ctx.fillStyle = "#4CAF50";
        const radius = 20;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x + 17 + radius, this.y + 75);
        this.ctx.arcTo(this.x + 183, this.y + 75, this.x + 183, this.y + 5, 0);
        this.ctx.arcTo(this.x + 183, this.y + 5, this.x + 17 + radius, this.y + 5, radius);
        this.ctx.arcTo(this.x + 17, this.y + 5, this.x + 17, this.y + 75 - radius, radius);
        this.ctx.arcTo(this.x + 17, this.y + 75, this.x + 17 + radius, this.y + 75, 0);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = "#4CAF50";
        this.ctx.beginPath();
        this.ctx.ellipse(this.x + 20, this.y + 105, 15, 40, this.degreeToRadian(15), 0, Math.PI * 2);
        this.ctx.ellipse(this.x + 180, this.y + 105, 15, 40, -this.degreeToRadian(15), 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = "#006405";
        this.ctx.beginPath();
        this.ctx.moveTo(this.x + 40, this.y + 75);
        this.ctx.lineTo(this.x + 160, this.y + 75);
        this.ctx.lineTo(this.x + 160, this.y + 45);
        this.ctx.lineTo(this.x + 40, this.y + 45);
        this.ctx.closePath();
        this.ctx.fill();
    }

    private drawFace() {
        this.ctx.fillStyle = "#fce4b2";
        this.ctx.beginPath();
        this.ctx.arc(this.x + 100, this.y + 120, 80, 0, Math.PI * 2);
        this.ctx.fill();
    }

    private drawEyes() {
        this.ctx.fillStyle = "white";
        this.ctx.beginPath();
        this.ctx.ellipse(this.x + 80, this.y + 105, 20, 27, this.degreeToRadian(20), 0, Math.PI * 2);
        this.ctx.ellipse(this.x + 120, this.y + 105, 20, 27, -this.degreeToRadian(20), 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = "black";
        this.ctx.beginPath();
        this.ctx.arc(this.x + 90, this.y + 105, 3, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(this.x + 110, this.y + 105, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    private drawMouth() {
        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x + 80, this.y + 180);
        this.ctx.bezierCurveTo(this.x + 110, this.y + 170, this.x + 110, this.y + 170, this.x + 120, this.y + 180);
        this.ctx.stroke();
    }

    private drawJacket() {
        this.ctx.fillStyle = "#ff5722";
        this.ctx.strokeStyle = "#ff5722";
        this.ctx.lineWidth = 1;

        this.ctx.beginPath();
        this.ctx.moveTo(this.x + 50, this.y + 180);
        this.ctx.bezierCurveTo(this.x + 30, this.y + 210, this.x + 30, this.y + 230, this.x + 30, this.y + 250);
        this.ctx.moveTo(this.x + 150, this.y + 180);
        this.ctx.bezierCurveTo(this.x + 170, this.y + 210, this.x + 170, this.y + 230, this.x + 170, this.y + 250);
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.beginPath();
        this.ctx.moveTo(this.x + 28, this.y + 250);
        this.ctx.lineTo(this.x + 172, this.y + 250);
        this.ctx.lineTo(this.x + 141, this.y + 150);
        this.ctx.lineTo(this.x + 58, this.y + 150);

        this.ctx.moveTo(this.x + 55, this.y + 250);
        this.ctx.lineTo(this.x + 50, this.y + 260);
        this.ctx.lineTo(this.x + 150, this.y + 260);
        this.ctx.lineTo(this.x + 150, this.y + 250);
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.beginPath();
        this.ctx.moveTo(this.x + 50, this.y + 260);
        this.ctx.bezierCurveTo(this.x + 90, this.y + 265, this.x + 130, this.y + 265, this.x + 150, this.y + 260);
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.strokeStyle = "#000000";
        this.ctx.beginPath();
        this.ctx.moveTo(this.x + 100, this.y + 265);
        this.ctx.lineTo(this.x + 100, this.y + 100);

        this.ctx.moveTo(this.x + 50, this.y + 245);
        this.ctx.lineTo(this.x + 60, this.y + 225);

        this.ctx.moveTo(this.x + 150, this.y + 245);
        this.ctx.lineTo(this.x + 140, this.y + 225);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.beginPath();
        this.ctx.moveTo(this.x + 72, this.y + 220);
        this.ctx.lineTo(this.x + 92, this.y + 220);
        this.ctx.lineTo(this.x + 92, this.y + 240);
        this.ctx.lineTo(this.x + 72, this.y + 240);
        this.ctx.lineTo(this.x + 72, this.y + 220);
        this.ctx.lineTo(this.x + 82, this.y + 230);
        this.ctx.lineTo(this.x + 92, this.y + 220);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.beginPath();
        this.ctx.moveTo(this.x + 108, this.y + 220);
        this.ctx.lineTo(this.x + 128, this.y + 220);
        this.ctx.lineTo(this.x + 128, this.y + 240);
        this.ctx.lineTo(this.x + 108, this.y + 240);
        this.ctx.lineTo(this.x + 108, this.y + 220);
        this.ctx.lineTo(this.x + 118, this.y + 230);
        this.ctx.lineTo(this.x + 128, this.y + 220);

        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.fillStyle = "#4CAF50";
        this.ctx.beginPath();
        this.ctx.ellipse(this.x + 125, this.y + 195, 10, 30, this.degreeToRadian(70), 0, Math.PI * 2);
        this.ctx.ellipse(this.x + 75, this.y + 195, 10, 30, -this.degreeToRadian(70), 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();
    }


    private drawGloves() {
        this.ctx.fillStyle = "#4CAF50";

        this.ctx.beginPath();
        this.ctx.ellipse(this.x + 40, this.y + 250, 15, 15, this.degreeToRadian(0), 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.beginPath();
        this.ctx.ellipse(this.x + 160, this.y + 250, 15, 15, this.degreeToRadian(0), 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.ellipse(this.x + 55, this.y + 245, 5, 5, this.degreeToRadian(0), 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.beginPath();
        this.ctx.ellipse(this.x + 145, this.y + 245, 5, 5, this.degreeToRadian(0), 0, Math.PI * 2); // Палец на перчатке
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
    }

    private drawLegs() {
        this.ctx.fillStyle = "#445d44";
        this.ctx.beginPath();

        this.ctx.moveTo(this.x + 50, this.y + 250);
        this.ctx.lineTo(this.x + 150, this.y + 250);
        this.ctx.lineTo(this.x + 150, this.y + 275);
        this.ctx.lineTo(this.x + 50, this.y + 275);

        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.fillStyle = "#374137";

        this.ctx.beginPath();
        this.ctx.ellipse(this.x + 70, this.y + 275, 5, 33, this.degreeToRadian(85), 0, Math.PI * 2);
        this.ctx.ellipse(this.x + 130, this.y + 275, 5, 33, -this.degreeToRadian(85), 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();
    }

    private degreeToRadian(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    public setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public getBounds() {
        return {
            left: this.x + 17,
            right: this.x + 183,
            top: this.y + 5,
            bottom: this.y + 275,
        };
    }

    public getX() {
        return this.x;
    }

    public getY() {
        return this.y;
    }
}

window.onload = () => {
    new CanvasApp("canvas");
};
