"use strict";
function main() {
    var canvas = document.getElementById("canvas"); // Явное указание типа
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    var ctx = canvas.getContext("2d"); // Получаем 2D контекст
    if (!ctx) {
        console.error("2D context not supported or canvas not properly initialized!");
        return;
    }
    // Теперь ctx можно использовать для рисования
    ctx.fillStyle = "red"; // Задаем цвет заливки
    ctx.fillRect(10, 10, 100, 50); // Рисуем прямоугольник
}
main();
