import './style.css'

function main (): void {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement; // Явное указание типа
    if (!canvas) {
        console.error("Canvas element not found!");
        return
    }

    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d"); // Получаем 2D контекст
    if (!ctx) {
        console.error("2D context not supported or canvas not properly initialized!");
        return;
    }

    drawKyle(ctx);
}

function drawHat(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#4CAF50";
    const radius = 20;
    ctx.beginPath();
    ctx.moveTo(167 + radius, 175);
    ctx.arcTo(333, 175, 333, 95, 0);
    ctx.arcTo(333, 95, 167 + radius, 95, radius);
    ctx.arcTo(167, 95, 167, 175 - radius, radius);
    ctx.arcTo(167, 175, 167 + radius, 175, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#4CAF50";
    ctx.beginPath();
    ctx.ellipse(170, 205, 15, 40, degreeToRadian(15), 0, Math.PI * 2);
    ctx.ellipse(330, 205, 15, 40, -degreeToRadian(15), 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#006405";
    ctx.beginPath();
    ctx.moveTo(180, 175);
    ctx.lineTo(320, 175);
    ctx.lineTo(320, 145);
    ctx.lineTo(180, 145);
    ctx.closePath();

    ctx.fill();
}

function drawFace(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#fce4b2";
    ctx.beginPath();
    ctx.arc(250, 220, 80, 0, Math.PI * 2);
    ctx.fill();
}

function drawEyes(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.ellipse(230, 205, 20, 27, degreeToRadian(20), 0, Math.PI * 2);
    ctx.ellipse(270, 205, 20, 27, -degreeToRadian(20), 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(240, 205, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(260, 205, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawMouth(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(230, 280);
    ctx.bezierCurveTo(260, 270, 260, 270, 270, 280);
    ctx.stroke();
}

function drawJacket(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#ff5722";
    ctx.strokeStyle = "#ff5722";
    ctx.beginPath();
    ctx.moveTo(200, 280);
    ctx.bezierCurveTo(180, 310, 180, 330, 180, 350);
    ctx.moveTo(300, 280);
    ctx.bezierCurveTo(320, 310, 320, 330, 320, 350);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(178, 350);
    ctx.lineTo(322, 350);
    ctx.lineTo(291, 250);
    ctx.lineTo(208, 250);

    ctx.moveTo(205, 350);
    ctx.lineTo(200, 360);
    ctx.lineTo(300, 360);
    ctx.lineTo(300, 350);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(200, 360);
    ctx.bezierCurveTo(240, 365, 280, 365, 300, 360);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    ctx.strokeStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(250, 365);
    ctx.lineTo(250, 200)

    ctx.moveTo(200, 345);
    ctx.lineTo(210, 325);

    ctx.moveTo(300, 345);
    ctx.lineTo(290, 325);
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = "#4CAF50";
    ctx.beginPath();
    ctx.ellipse(275, 295, 10, 30, degreeToRadian(70), 0, Math.PI * 2);
    ctx.ellipse(225, 295, 10, 30, -degreeToRadian(70), 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

function drawGloves(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#4CAF50";
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.ellipse(190, 350, 15, 15, degreeToRadian(0), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.ellipse(205, 345, 5, 5, degreeToRadian(0), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.ellipse(310, 350, 15, 15, degreeToRadian(0), 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(295, 345, 5, 5, degreeToRadian(0), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function drawLegs(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#445d44";
    ctx.beginPath();

    ctx.moveTo(210, 360);
    ctx.lineTo(290, 360);
    ctx.lineTo(290, 385);
    ctx.lineTo(210, 385);

    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "#374137";

    ctx.beginPath();
    ctx.ellipse(220, 385, 5, 33, degreeToRadian(85), 0, Math.PI * 2);
    ctx.ellipse(280, 385, 5, 33, -degreeToRadian(85), 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

function degreeToRadian(degrees: number): number {
    return  degrees * (Math.PI / 180);
}

function drawKyle(ctx: CanvasRenderingContext2D) {
    drawLegs(ctx);
    drawJacket(ctx);
    drawGloves(ctx);
    drawFace(ctx);
    drawHat(ctx);
    drawEyes(ctx);
    drawMouth(ctx);
}

main();
