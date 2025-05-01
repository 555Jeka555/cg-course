from PyQt5 import QtWidgets
from PyQt5.QtCore import Qt
from OpenGL.GL import *
from OpenGL.GL.shaders import compileProgram, compileShader
from OpenGL.arrays import vbo
import numpy as np
from PIL import Image
# перестакивание мыши в масштабе 1 к 1 (по пикселям) [+]
# масштабирование должно сохранять точку в центре экрана [+]


VERTEX_SHADER = """
#version 450 core

layout(location = 0) in vec3 vertex_position;

void main()
{
    gl_Position = vec4(vertex_position, 1.0);
}
"""

FRAGMENT_SHADER = """
#version 450

layout(location = 0) uniform float rect_width;
layout(location = 1) uniform float rect_height;
layout(location = 2) uniform vec2 area_w;
layout(location = 3) uniform vec2 area_h;
layout(location = 4) uniform uint max_iterations;

uniform sampler1D palette_texture;

out vec4 pixel_color;

void main()
{
    const vec2 C = vec2(gl_FragCoord.x * (area_w.y - area_w.x) / rect_width  + area_w.x,
                        gl_FragCoord.y * (area_h.y - area_h.x) / rect_height + area_h.x);
    vec2 Z = vec2(0.0);
    uint iteration = 0;

    while (iteration < max_iterations)
    {
        const float x = Z.x * Z.x - Z.y * Z.y + C.x;
        const float y = 2.0 * Z.x * Z.y + C.y;

        if (x * x + y * y > 4.0)
            break;

        Z.x = x;
        Z.y = y;

        ++iteration;
    }

    const float normalized_iteration = float(iteration) / float(max_iterations);
    vec3 color = texture(palette_texture, normalized_iteration).rgb;

    pixel_color = vec4((iteration == max_iterations ? vec3(0.0) : color), 1.0);
}
"""


class GLWidget(QtWidgets.QOpenGLWidget):
    def __init__(self, parent=None):
        super(GLWidget, self).__init__(parent)
        self.setWindowTitle("Mandelbrot")
        self.setGeometry(300, 300, 800, 600)
        self.area_w = np.array([-2.0, 1.0], dtype=np.float32)
        self.area_h = np.array([-1.0, 1.0], dtype=np.float32)
        self.max_iterations = 1000
        self.zoom_factor = 0.1
        self.last_pos = None

    def wheelEvent(self, event):
        delta = event.angleDelta().y() / 120
        zoom_factor = 1 + delta * self.zoom_factor
        center_x = (self.area_w[1] + self.area_w[0]) / 2
        center_y = (self.area_h[1] + self.area_h[0]) / 2
        self.area_w = np.array([center_x - (center_x - self.area_w[0]) * zoom_factor,
                                center_x + (self.area_w[1] - center_x) * zoom_factor])
        self.area_h = np.array([center_y - (center_y - self.area_h[0]) * zoom_factor,
                                center_y + (self.area_h[1] - center_y) * zoom_factor])
        self.update()

    def mousePressEvent(self, event):
        if event.buttons() == Qt.LeftButton:
            self.last_pos = event.pos()

    def mouseMoveEvent(self, event):
        if event.buttons() == Qt.LeftButton and self.last_pos:
            dx = event.x() - self.last_pos.x()
            dy = self.last_pos.y() - event.y()

            area_width = self.area_w[1] - self.area_w[0]
            area_height = self.area_h[1] - self.area_h[0]

            dx_scaled = dx * area_width / self.width()
            dy_scaled = dy * area_height / self.height()

            self.area_w -= dx_scaled
            self.area_h -= dy_scaled

            self.last_pos = event.pos()
            self.update()

    def mouseReleaseEvent(self, event):
        if event.button() == Qt.LeftButton:
            self.last_pos = None

    def initializeGL(self):
        self.program = compileProgram(
            compileShader(VERTEX_SHADER, GL_VERTEX_SHADER),
            compileShader(FRAGMENT_SHADER, GL_FRAGMENT_SHADER)
        )
        self.vao = glGenVertexArrays(1)
        glBindVertexArray(self.vao)

        vertices = np.array([[-1.0, -1.0, 0.0], [1.0, -1.0, 0.0], [1.0, 1.0, 0.0], [-1.0, 1.0, 0.0]], dtype=np.float32)
        self.vbo = vbo.VBO(vertices)
        self.vbo.bind()

        glEnableVertexAttribArray(0)
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, None)

        palette_image = Image.open("palette.png")

        self.palette_texture = glGenTextures(1)
        glBindTexture(GL_TEXTURE_1D, self.palette_texture)
        glTexImage1D(GL_TEXTURE_1D, 0, GL_RGB, palette_image.width, 0, GL_RGB, GL_UNSIGNED_BYTE, palette_image.tobytes())
        glTexParameteri(GL_TEXTURE_1D, GL_TEXTURE_MIN_FILTER, GL_LINEAR)
        glTexParameteri(GL_TEXTURE_1D, GL_TEXTURE_MAG_FILTER, GL_LINEAR)

    def paintGL(self):
        glClear(GL_COLOR_BUFFER_BIT)
        glUseProgram(self.program)

        glUniform1f(0, self.width())
        glUniform1f(1, self.height())
        glUniform2fv(2, 1, self.area_w)
        glUniform2fv(3, 1, self.area_h)
        glUniform1ui(4, self.max_iterations)

        glActiveTexture(GL_TEXTURE0)
        glBindTexture(GL_TEXTURE_1D, self.palette_texture)

        glUniform1i(glGetUniformLocation(self.program, "palette_texture"), 0)

        glBindVertexArray(self.vao)
        glDrawArrays(GL_TRIANGLE_FAN, 0, 4)

    def keyPressEvent(self, event):
        step = 10

        if event.key() == Qt.Key_Down:
            dx = 0
            dy = step
        elif event.key() == Qt.Key_Up:
            dx = 0
            dy = -step
        elif event.key() == Qt.Key_Right:
            dx = -step
            dy = 0
        elif event.key() == Qt.Key_Left:
            dx = step
            dy = 0
        else:
            return

        area_width = self.area_w[1] - self.area_w[0]
        area_height = self.area_h[1] - self.area_h[0]
        dx_scaled = dx * area_width / self.width()
        dy_scaled = dy * area_height / self.height()
        self.area_w -= dx_scaled
        self.area_h -= dy_scaled

        self.update()

    def closeEvent(self, event):
        glDeleteBuffers(1, [self.vbo.buffer])
        glDeleteVertexArrays(1, [self.vao])


if __name__ == "__main__":
    app = QtWidgets.QApplication([])
    widget = GLWidget()
    widget.show()
    app.exec_()