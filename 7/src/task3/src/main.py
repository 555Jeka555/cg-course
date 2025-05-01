from PyQt5 import QtWidgets, QtCore
from OpenGL.GL import *
from OpenGL.GL.shaders import compileProgram, compileShader
import numpy as np

VERTEX_SHADER = """
#version 330 core

layout(location = 0) in vec3 position;

uniform float progress;
uniform mat4 projection_view;

void main()
{
    vec3 initial_position = vec3(position.x, position.y, position.x * position.x + position.y * position.y);
    vec3 final_position = vec3(position.x, position.y, position.x * position.x - position.y * position.y);
    vec3 morphed_position = mix(initial_position, final_position, progress);

    gl_Position = projection_view * vec4(morphed_position, 1.0);
}
"""

# перспективное преборазование [+]
# gl_Position = projection * view * vec4(morphed_position, 1.0); 1.0 - для чего используется [+]
# назначение атрибутивных переменных [+]
# вместо перемемножения projection and view использовать производние матриц вне шайдера [+]
# почему внесение вычислений вне шейдера ускоряет отрисовку [+]
# сделать вращение камеры [-]

FRAGMENT_SHADER = """
#version 330 core

out vec4 color;

void main()
{
    color = vec4(1.0, 1.0, 1.0, 1.0);
}
"""


class GLWidget(QtWidgets.QOpenGLWidget):
    def __init__(self, parent=None):
        super(GLWidget, self).__init__(parent)
        self.setWindowTitle("Morphing")
        self.setGeometry(300, 300, 800, 600)
        self.progress = 0.0
        self.timer = QtCore.QTimer(self)
        self.timer.timeout.connect(self.update_progress)
        self.timer.start(16)
        self.direction = 1
        self.speed = 0.05
        self.view_matrix = self.rotate_y(45) @ self.translate_z(-3.5) @ self.translate_x(-2.5)
        self.projection_matrix = self.perspective(45, self.width() / self.height(), 0.1, 100)
        self.projection_view_matrix = np.dot(self.projection_matrix, self.view_matrix)



    def initializeGL(self):
        glClearColor(0.2, 0.2, 0.2, 1.0)
        glEnable(GL_DEPTH_TEST)
        self.program = compileProgram(
            compileShader(VERTEX_SHADER, GL_VERTEX_SHADER),
            compileShader(FRAGMENT_SHADER, GL_FRAGMENT_SHADER)
        )

    def paintGL(self):
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
        glUseProgram(self.program)

        glUniform1f(glGetUniformLocation(self.program, "progress"), self.progress)
        glUniformMatrix4fv(glGetUniformLocation(self.program, "projection_view"), 1, GL_TRUE, self.projection_view_matrix)

        self.draw_surface()

    def draw_surface(self):
        rows, cols = 100, 100
        glBegin(GL_LINES)
        for i in range(rows - 1):
            for j in range(cols - 1):
                x0 = -1.0 + 2.0 * i / (rows - 1)
                y0 = -1.0 + 2.0 * j / (cols - 1)
                z0 = x0 * x0 + y0 * y0

                x1 = -1.0 + 2.0 * (i + 1) / (rows - 1)
                y1 = -1.0 + 2.0 * j / (cols - 1)
                z1 = x1 * x1 + y1 * y1

                x2 = -1.0 + 2.0 * i / (rows - 1)
                y2 = -1.0 + 2.0 * (j + 1) / (cols - 1)
                z2 = x2 * x2 + y2 * y2

                glVertex3f(x0, y0, z0)
                glVertex3f(x1, y1, z1)

                glVertex3f(x1, y1, z1)
                glVertex3f(x2, y2, z2)

                glVertex3f(x2, y2, z2)
                glVertex3f(x0, y0, z0)
        glEnd()

    def update_progress(self):
        self.progress += self.direction * self.speed
        if self.progress >= 1.0:
            self.direction = -1
        elif self.progress <= 0.0:
            self.direction = 1
        self.update()

    def perspective(self, fov, aspect, near, far):
        f = 1.0 / np.tan(np.radians(fov) / 2)
        projection_matrix = np.array([[f / aspect, 0, 0, 0],
                                      [0, f, 0, 0],
                                      [0, 0, (far + near) / (near - far), 2 * far * near / (near - far)],
                                      [0, 0, -1, 0]], dtype=np.float32)
        return projection_matrix

    def closeEvent(self, event):
        self.timer.stop()

    def rotate_y(self, angle):
        angle = np.radians(angle)
        c = np.cos(angle)
        s = np.sin(angle)
        rotation_matrix = np.array([[c, 0, -s, 0],
                                    [0, 1, 0, 0],
                                    [s, 0, c, 0],
                                    [0, 0, 0, 1]], dtype=np.float32)
        return rotation_matrix

    def translate_z(self, z):
        translation_matrix = np.array([[1, 0, 0, 0],
                                       [0, 1, 0, 0],
                                       [0, 0, 1, z],
                                       [0, 0, 0, 1]], dtype=np.float32)
        return translation_matrix

    def translate_x(self, x):
        translation_matrix = np.array([[1, 0, 0, x],
                                       [0, 1, 0, 0],
                                       [0, 0, 1, 0],
                                       [0, 0, 0, 1]], dtype=np.float32)
        return translation_matrix


if __name__ == "__main__":
    app = QtWidgets.QApplication([])
    widget = GLWidget()
    widget.show()
    app.exec_()