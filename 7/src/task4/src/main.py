from PyQt5 import QtWidgets
from PyQt5.QtCore import Qt
from OpenGL.GL import *
from OpenGL.GL.shaders import compileProgram, compileShader
from OpenGL.arrays import vbo
import numpy as np
from PIL import Image

FRAGMENT_SHADER = """
#version 450

layout(location = 0) uniform float width;
layout(location = 1) uniform float height;
layout(location = 2) uniform vec2 area_w;
layout(location = 3) uniform vec2 area_h;
layout(location = 4) uniform uint max_iterations;

uniform sampler1D palette_texture;

out vec4 pixel_color;

void main()
{
    const vec2 complex_coord  = vec2(gl_FragCoord.x * (area_w.y - area_w.x) / width + area_w.x,
                        gl_FragCoord.y * (area_h.y - area_h.x) / height + area_h.x); // экранные координаты в точку комлпексной плоскости
    vec2 current_iteration_value = vec2(0.0);
    uint iteration = 0;

    while (iteration < max_iterations)
    {
        // Z_{n+1} = Z_n^2 + C
        // Z = x + yi 
        // Z^2 = (x^2 - y^2) + (2xy)i
        
        // Xn+1 = Xn^2 - Yn^2 + X0
        // Yn+1 = 2XnYn + Y0
        
        const float x = current_iteration_value.x * current_iteration_value.x - 
            current_iteration_value.y * current_iteration_value.y + complex_coord.x;
        const float y = 2.0 * current_iteration_value.x * current_iteration_value.y + complex_coord.y;

        // Последовательность расходится если |Zn| > 2

        if (x * x + y * y > 4.0)
            break;

        current_iteration_value.x = x;
        current_iteration_value.y = y;

        ++iteration;
    }

    const float normalized_iteration = float(iteration) / float(max_iterations); // В диапозон [0, 1]
    vec3 color = texture(palette_texture, normalized_iteration).rgb;

    pixel_color = vec4((iteration == max_iterations ? vec3(0.0) : color), 1.0);
}
"""

VERTEX_SHADER = """
#version 450 core

layout(location = 0) in vec3 vertex_position;

void main()
{
    gl_Position = vec4(vertex_position, 1.0);
}
"""


class GLWidget(QtWidgets.QOpenGLWidget):
    def __init__(self, parent=None):
        super(GLWidget, self).__init__(parent)
        self.setWindowTitle("The Mandelbrot Fractal")
        self.setGeometry(300, 300, 800, 600)

        self.area_w = np.array([-2.0, 1.0], dtype=np.float32)  # Диапазон по X (Re)
        self.area_h = np.array([-1.0, 1.0], dtype=np.float32)  # Диапазон по Y (Im)
        self.max_iterations = 1000 # разрешение, можно увеличить

        self.zoom_factor = 0.1
        self.last_pos = None

    def initializeGL(self):
        self.program = compileProgram(
            compileShader(VERTEX_SHADER, GL_VERTEX_SHADER),
            compileShader(FRAGMENT_SHADER, GL_FRAGMENT_SHADER)
        )
        self.vao = glGenVertexArrays(1)     # (Vertex Array Object) запоминает привязки VBO и форматы атрибутов
        glBindVertexArray(self.vao)

        vertices = np.array([[-1.0, -1.0, 0.0], [1.0, -1.0, 0.0], [1.0, 1.0, 0.0], [-1.0, 1.0, 0.0]], dtype=np.float32)
        self.vbo = vbo.VBO(vertices)        # (Vertex Buffer Object) хранит данные вершин
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

    def wheelEvent(self, event):
        delta = event.angleDelta().y() / 120
        zoom_factor = 1 - delta * self.zoom_factor

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

    def keyPressEvent(self, event):
        step = 20

        if event.key() == Qt.Key_Up:
            dx = 0
            dy = -step
        elif event.key() == Qt.Key_Down:
            dx = 0
            dy = step
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
        try:
            if hasattr(self, 'vbo') and self.vbo:
                self.vbo.delete()
            if hasattr(self, 'vao') and self.vao:
                glDeleteVertexArrays(1, [self.vao])
        except Exception as e:
            print(f"Cleanup error (ignored): {str(e)}")

        event.accept()


if __name__ == "__main__":
    app = QtWidgets.QApplication([])
    widget = GLWidget()
    widget.show()
    app.exec_()