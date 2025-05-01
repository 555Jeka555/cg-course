from PyQt5 import QtWidgets, QtCore, QtGui
from OpenGL.GL import *
from OpenGL.GL.shaders import compileProgram, compileShader
import numpy as np

VERTEX_SHADER = """
#version 330 core
layout(location = 0) in vec3 position;

uniform float progress;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    vec3 initial_position = vec3(position.x, position.y, position.x * position.x + position.y * position.y);
    vec3 final_position = vec3(position.x, position.y, position.x * position.x - position.y * position.y);
    vec3 morphed_position = mix(initial_position, final_position, progress);

    gl_Position = projection * view * model * vec4(morphed_position, 1.0);
}
"""


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
        self.setWindowTitle("Centered Rotating Morphing Surface with Zoom")
        self.setGeometry(300, 300, 800, 600)

        # Анимация морфинга
        self.progress = 0.0
        self.direction = 1
        self.speed = 0.05

        # Параметры вращения и масштабирования фигуры
        self.rotation_x = 0.0
        self.rotation_y = 0.0
        self.scale = 1.0
        self.model_matrix = np.identity(4, dtype=np.float32)

        # Матрицы камеры
        self.view_matrix = np.identity(4, dtype=np.float32)
        self.projection_matrix = np.identity(4, dtype=np.float32)

        # Управление мышью
        self.last_pos = QtCore.QPoint()
        self.setMouseTracking(True)

        # Таймер для анимации
        self.timer = QtCore.QTimer(self)
        self.timer.timeout.connect(self.update_progress)
        self.timer.start(16)

    def initializeGL(self):
        glClearColor(0.2, 0.2, 0.2, 1.0)
        glEnable(GL_DEPTH_TEST)
        self.program = compileProgram(
            compileShader(VERTEX_SHADER, GL_VERTEX_SHADER),
            compileShader(FRAGMENT_SHADER, GL_FRAGMENT_SHADER)
        )
        self.update_view_matrix()

    def resizeGL(self, w, h):
        glViewport(0, 0, w, h)
        aspect = w / h if h > 0 else 1.0
        self.projection_matrix = self.perspective(45, aspect, 0.1, 100)

    def paintGL(self):
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
        glUseProgram(self.program)

        # Обновляем матрицу модели (вращение и масштабирование фигуры)
        self.update_model_matrix()

        # Передаем параметры в шейдер
        glUniform1f(glGetUniformLocation(self.program, "progress"), self.progress)
        glUniformMatrix4fv(glGetUniformLocation(self.program, "model"),
                           1, GL_TRUE, self.model_matrix)
        glUniformMatrix4fv(glGetUniformLocation(self.program, "view"),
                           1, GL_TRUE, self.view_matrix)
        glUniformMatrix4fv(glGetUniformLocation(self.program, "projection"),
                           1, GL_TRUE, self.projection_matrix)

        self.draw_surface()

    def update_model_matrix(self):
        """Обновляет матрицу модели с учетом текущих углов вращения и масштаба"""
        self.model_matrix = np.identity(4, dtype=np.float32)
        # Применяем масштабирование
        self.model_matrix = self.scale_matrix(self.scale) @ self.model_matrix
        # Применяем вращение
        self.model_matrix = self.rotate_y(self.rotation_y) @ self.model_matrix
        self.model_matrix = self.rotate_x(self.rotation_x) @ self.model_matrix

    def update_view_matrix(self):
        """Позиция камеры, смотрящей на центр сцены"""
        # Камера отодвинута по оси Z и смотрит в центр (0,0,0)
        self.view_matrix = self.look_at(0, 0, 3,  # Позиция камеры
                                        0, 0, 0,  # Точка, на которую смотрим
                                        0, 1, 0)  # Вектор "вверх"

    def look_at(self, eye_x, eye_y, eye_z, center_x, center_y, center_z, up_x, up_y, up_z):
        """Создает view матрицу, аналогичную gluLookAt"""
        eye = np.array([eye_x, eye_y, eye_z])
        center = np.array([center_x, center_y, center_z])
        up = np.array([up_x, up_y, up_z])

        f = (center - eye)
        f = f / np.linalg.norm(f)

        s = np.cross(f, up)
        s = s / np.linalg.norm(s)

        u = np.cross(s, f)

        view = np.identity(4, dtype=np.float32)
        view[0, :3] = s
        view[1, :3] = u
        view[2, :3] = -f
        view[:3, 3] = [-np.dot(s, eye), -np.dot(u, eye), np.dot(f, eye)]

        return view

    def mousePressEvent(self, event):
        self.last_pos = event.pos()

    def mouseMoveEvent(self, event):
        if event.buttons() & QtCore.Qt.LeftButton:
            dx = event.x() - self.last_pos.x()
            dy = event.y() - self.last_pos.y()

            self.rotation_y += dx * 0.5
            self.rotation_x += dy * 0.5

            self.last_pos = event.pos()
            self.update()

    def wheelEvent(self, event):
        delta = event.angleDelta().y() / 120
        # Изменяем масштаб (ограничиваем диапазоном от 0.1 до 10)
        self.scale = max(0.1, min(10.0, self.scale + delta * 0.1))
        self.update()

    def scale_matrix(self, scale):
        """Создает матрицу масштабирования"""
        return np.array([
            [scale, 0, 0, 0],
            [0, scale, 0, 0],
            [0, 0, scale, 0],
            [0, 0, 0, 1]
        ], dtype=np.float32)

    def draw_surface(self):
        rows, cols = 100, 100
        glBegin(GL_LINES)
        for i in range(rows - 1):
            for j in range(cols - 1):
                x0 = -1.0 + 2.0 * i / (rows - 1)
                y0 = -1.0 + 2.0 * j / (rows - 1)
                z0 = x0 * x0 + y0 * y0

                x1 = -1.0 + 2.0 * (i + 1) / (rows - 1)
                y1 = -1.0 + 2.0 * j / (rows - 1)
                z1 = x1 * x1 + y1 * y1

                x2 = -1.0 + 2.0 * i / (rows - 1)
                y2 = -1.0 + 2.0 * (j + 1) / (rows - 1)
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

    def rotate_x(self, angle):
        angle = np.radians(angle)
        c = np.cos(angle)
        s = np.sin(angle)
        return np.array([
            [1, 0, 0, 0],
            [0, c, -s, 0],
            [0, s, c, 0],
            [0, 0, 0, 1]
        ], dtype=np.float32)

    def rotate_y(self, angle):
        angle = np.radians(angle)
        c = np.cos(angle)
        s = np.sin(angle)
        return np.array([
            [c, 0, s, 0],
            [0, 1, 0, 0],
            [-s, 0, c, 0],
            [0, 0, 0, 1]
        ], dtype=np.float32)

    def perspective(self, fov, aspect, near, far):
        f = 1.0 / np.tan(np.radians(fov) / 2)
        return np.array([
            [f / aspect, 0, 0, 0],
            [0, f, 0, 0],
            [0, 0, (far + near) / (near - far), 2 * far * near / (near - far)],
            [0, 0, -1, 0]
        ], dtype=np.float32)


if __name__ == "__main__":
    app = QtWidgets.QApplication([])
    widget = GLWidget()
    widget.show()
    app.exec_()