export class Letter {
    constructor(letterDrawStrategy, x, color, phase, initialY = Letter.INIT_Y, jumpHeight = Letter.HEIGHT_OF_JUMP, animationDuration = Letter.ANIMATION_DURATION, startTime = null) {
        this.letterDrawStrategy = letterDrawStrategy;
        this.x = x;
        this.color = color;
        this.phase = phase;
        this.initialY = initialY;
        this.jumpHeight = jumpHeight;
        this.animationDuration = animationDuration;
        this.startTime = startTime;
    }
    draw(ctx, currentTime) {
        if (this.startTime === null) {
            this.startTime = currentTime;
        }
        const time = (currentTime - this.startTime + this.phase) % this.animationDuration;
        const jumpProgress = Math.sin(time / this.animationDuration * Math.PI);
        const y = this.initialY - jumpProgress * this.jumpHeight;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        this.letterDrawStrategy.draw(ctx, this.x, y);
        ctx.stroke();
    }
}
Letter.INIT_Y = 100;
Letter.HEIGHT_OF_JUMP = 50;
Letter.ANIMATION_DURATION = 1000;
