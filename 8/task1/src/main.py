from PyQt5.QtWidgets import QApplication, QOpenGLWidget
from PyQt5.QtCore import Qt, QTimer, QPoint
from OpenGL.GL import *
from OpenGL.GL.shaders import compileShader, compileProgram
import numpy as np

# Фоновое излучение (Ambient): Имитирует рассеянный свет,
# который равномерно освещает все объекты сцены без учёта их ориентации
# Не зависит от направления источника света и нормалей поверхности
# Рассчитывается как произведение ambient_color_света * ambient_color_материала
# Пример: Освещение от стен помещения, облачного неба

# Диффузное излучение (Diffuse): Моделирует взаимодействие направленного
# света с матовыми поверхностями по закону Ламберта
# Зависит от угла между нормалью поверхности и направлением света (cosθ = dot(n, l))
# Рассчитывается как diffuse_color_света * (dot(n,l) * diffuse_color_материала)
# Пример: Матовая машина

# Зеркальное излучение (Specular):  Создаёт направленные блики по модели Фонга/Блинна
# Зависит от угла между вектором обзора и отражённым лучом. Использует степень блеска для контроля резкости блика
# Рассчитывается как specular_color_света * (pow(dot(v,r), shininess) * specular_color_материала)
# Пример: Блики на металлических поверхностях

VERTEX_SHARED = """
#version 330 core
layout(location = 0) in vec3 aPos;     // позиция вершины (3D координаты)
layout(location = 1) in vec3 aNormal;  // нормаль вершины (3D вектор)

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec3 FragPos;  // позиция вершины в мировых координатах (для фрагментного шейдера)
out vec3 Normal;   // нормаль в мировых координатах (для фрагментного шейдера)

void main() {
    gl_Position = projection * view * model * vec4(aPos, 1.0);
    FragPos = vec3(model * vec4(aPos, 1.0));                // позиция вершины в мировых координатах.
    Normal = mat3(transpose(inverse(model))) * aNormal;     // нормаль, преобразованная в мировые координаты
}
"""

FRAGMENT_SHARED = """
#version 330 core
in vec3 FragPos;
in vec3 Normal;

out vec4 FragColor;

uniform vec3 lightPos;
uniform vec3 viewPos;

uniform vec3 lightAmbient;
uniform vec3 lightDiffuse;
uniform vec3 lightSpecular;

uniform vec3 materialAmbient;
uniform vec3 materialDiffuse;
uniform vec3 materialSpecular;
uniform float materialShininess;

void main() {
    // Ambient
    vec3 ambient = lightAmbient * materialAmbient;

    // Diffuse 
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(lightPos - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);             // Если угол больше 90°, освещение отсутствует
    vec3 diffuse = lightDiffuse * (diff * materialDiffuse);

    // Specular
    vec3 viewDir = normalize(viewPos - FragPos);   // направление от фрагмента к камере.
    vec3 reflectDir = reflect(-lightDir, norm);    // отражённый вектор света относительно нормали.
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), materialShininess);    // Вычисление угла между взглядом и отражённым светом. Возведение в степень materialShininess для контроля резкости блика.
    vec3 specular = lightSpecular * (spec * materialSpecular);

    vec3 result = ambient + diffuse + specular;
    FragColor = vec4(result, 1.0);
}
"""


class Material:
    def __init__(self):
        self.diffuse = [1.0, 0.5, 0.31]  # Цвет диффузного отражения
        self.specular = [0.5, 0.5, 0.5]  # Цвет зеркального отражения
        self.ambient = [0.2, 0.2, 0.2]  # Цвет фонового отражения
        self.shininess = 32.0  # Степень блеска


class Light:
    def __init__(self):
        self.position = [2.0, 2.0, 2.0]
        self.diffuse = [1.0, 1.0, 1.0]  # Цвет диффузного излучения
        self.specular = [1.0, 1.0, 1.0]  # Цвет зеркального излучения
        self.ambient = [0.2, 0.2, 0.2]  # Цвет фонового излучения


class GLWidget(QOpenGLWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Task1")
        self.setGeometry(300, 300, 800, 600)

        self.rotation_x = 0.0
        self.rotation_y = 0.0
        self.scale = 1.0

        self.material = Material()
        self.light = Light()
        self.camera_pos = [0.0, 0.0, 3.0]
        self.rotation = [0, 0]

        self.last_pos = QPoint()
        self.setMouseTracking(True)

    def initializeGL(self):
        glEnable(GL_DEPTH_TEST)
        self.program = compileProgram(
            compileShader(VERTEX_SHARED, GL_VERTEX_SHADER),
            compileShader(FRAGMENT_SHARED, GL_FRAGMENT_SHADER)
        )
        self.update_view_matrix()

        vertices = [
            # Позиции         # Нормали
            -0.5, -0.5, -0.5, 0.0, 0.0, -1.0,
            0.5, -0.5, -0.5, 0.0, 0.0, -1.0,
            0.5, 0.5, -0.5, 0.0, 0.0, -1.0,
            -0.5, 0.5, -0.5, 0.0, 0.0, -1.0,

            -0.5, -0.5, 0.5, 0.0, 0.0, 1.0,
            0.5, -0.5, 0.5, 0.0, 0.0, 1.0,
            0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
            -0.5, 0.5, 0.5, 0.0, 0.0, 1.0,

            -0.5, 0.5, 0.5, -1.0, 0.0, 0.0,
            -0.5, 0.5, -0.5, -1.0, 0.0, 0.0,
            -0.5, -0.5, -0.5, -1.0, 0.0, 0.0,
            -0.5, -0.5, 0.5, -1.0, 0.0, 0.0,

            0.5, 0.5, 0.5, 1.0, 0.0, 0.0,
            0.5, 0.5, -0.5, 1.0, 0.0, 0.0,
            0.5, -0.5, -0.5, 1.0, 0.0, 0.0,
            0.5, -0.5, 0.5, 1.0, 0.0, 0.0,

            -0.5, -0.5, -0.5, 0.0, -1.0, 0.0,
            0.5, -0.5, -0.5, 0.0, -1.0, 0.0,
            0.5, -0.5, 0.5, 0.0, -1.0, 0.0,
            -0.5, -0.5, 0.5, 0.0, -1.0, 0.0,

            -0.5, 0.5, -0.5, 0.0, 1.0, 0.0,
            0.5, 0.5, -0.5, 0.0, 1.0, 0.0,
            0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
            -0.5, 0.5, 0.5, 0.0, 1.0, 0.0
        ]

        indices = [
            0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4,
            8, 9, 10, 10, 11, 8, 12, 13, 14, 14, 15, 12,
            16, 17, 18, 18, 19, 16, 20, 21, 22, 22, 23, 20
        ]

        self.vao = glGenVertexArrays(1)
        self.vbo = glGenBuffers(1)
        self.ebo = glGenBuffers(1) # EBO (Element Buffer Object) буфер который хранит индексы вершин

        glBindVertexArray(self.vao)

        glBindBuffer(GL_ARRAY_BUFFER, self.vbo)
        glBufferData(GL_ARRAY_BUFFER, np.array(vertices, dtype=np.float32), GL_STATIC_DRAW)

        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, self.ebo)
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, np.array(indices, dtype=np.uint32), GL_STATIC_DRAW)

        # Атрибуты позиций
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 6 * 4, None)
        glEnableVertexAttribArray(0)

        # Атрибуты нормалей
        glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 6 * 4, ctypes.c_void_p(3 * 4))
        glEnableVertexAttribArray(1)

        glBindVertexArray(0)

    def resizeGL(self, w, h):
        glViewport(0, 0, w, h)

    def paintGL(self):
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
        glUseProgram(self.program)

        self.update_model_matrix()

        view = np.eye(4, dtype=np.float32)
        view[2, 3] = -3.0

        projection = self.perspective(45, self.width() / self.height(), 0.1, 100)

        glUniformMatrix4fv(glGetUniformLocation(self.program, "model"), 1, GL_TRUE, self.model_matrix)
        glUniformMatrix4fv(glGetUniformLocation(self.program, "view"), 1, GL_TRUE, view)
        glUniformMatrix4fv(glGetUniformLocation(self.program, "projection"), 1, GL_TRUE, projection)

        glUniform3fv(glGetUniformLocation(self.program, "materialAmbient"), 1, self.material.ambient)
        glUniform3fv(glGetUniformLocation(self.program, "materialDiffuse"), 1, self.material.diffuse)
        glUniform3fv(glGetUniformLocation(self.program, "materialSpecular"), 1, self.material.specular)
        glUniform1f(glGetUniformLocation(self.program, "materialShininess"), self.material.shininess)

        glUniform3fv(glGetUniformLocation(self.program, "lightPos"), 1, self.light.position)
        glUniform3fv(glGetUniformLocation(self.program, "lightAmbient"), 1, self.light.ambient)
        glUniform3fv(glGetUniformLocation(self.program, "lightDiffuse"), 1, self.light.diffuse)
        glUniform3fv(glGetUniformLocation(self.program, "lightSpecular"), 1, self.light.specular)
        glUniform3fv(glGetUniformLocation(self.program, "viewPos"), 1, self.camera_pos)

        glBindVertexArray(self.vao)
        glDrawElements(GL_TRIANGLES, 36, GL_UNSIGNED_INT, None)
        glBindVertexArray(0)

    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton:
            self.last_pos = event.pos()

    def mouseMoveEvent(self, event):
        if event.buttons() & Qt.LeftButton:
            dx = event.x() - self.last_pos.x()
            dy = event.y() - self.last_pos.y()
            self.rotation_x += dy * 0.5
            self.rotation_y += dx * 0.5
            self.last_pos = event.pos()
            self.update()

    def wheelEvent(self, event):
        delta = event.angleDelta().y() / 120
        self.scale = max(0.1, min(10.0, self.scale + delta * 0.1))  # масштаб от 0.1 до 10
        self.update()

    def update_model_matrix(self):
        self.model_matrix = np.identity(4, dtype=np.float32)

        self.model_matrix = self.scale_matrix(self.scale) @ self.model_matrix

        self.model_matrix = self.rotate_y(self.rotation_y) @ self.model_matrix
        self.model_matrix = self.rotate_x(self.rotation_x) @ self.model_matrix

    def update_view_matrix(self):
        self.view_matrix = self.convert_global_coords_to_camera_coords(0, 0, 3,  # позиция камеры
                                                                       0, 0, 0,  # точка, на которую смотрим
                                                                       0, 1, 0)  # вектор "вверх"

    def convert_global_coords_to_camera_coords(self, eye_x, eye_y, eye_z, center_x, center_y, center_z, up_x, up_y, up_z):
        eye = np.array([eye_x, eye_y, eye_z])
        center = np.array([center_x, center_y, center_z])
        up = np.array([up_x, up_y, up_z])

        z_axis = (center - eye)
        z_axis = z_axis / np.linalg.norm(z_axis)

        x_axis = np.cross(z_axis, up)
        x_axis = x_axis / np.linalg.norm(x_axis)

        y_axis = np.cross(x_axis, z_axis)

        view = np.identity(4, dtype=np.float32)
        view[0, :3] = x_axis
        view[1, :3] = y_axis
        view[2, :3] = -z_axis
        view[:3, 3] = [-np.dot(x_axis, eye), -np.dot(y_axis, eye), np.dot(z_axis, eye)]

        return view

    def scale_matrix(self, scale):
        return np.array([
            [scale, 0, 0, 0],
            [0, scale, 0, 0],
            [0, 0, scale, 0],
            [0, 0, 0, 1]
        ], dtype=np.float32)

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
        focus_distance = 1.0 / np.tan(np.radians(fov) / 2)
        return np.array([
            [focus_distance / aspect, 0, 0, 0],
            [0, focus_distance, 0, 0],
            [0, 0, (far + near) / (near - far), 2 * far * near / (near - far)],
            [0, 0, -1, 0]
        ], dtype=np.float32)


if __name__ == '__main__':
    import sys
    app = QApplication(sys.argv)
    window = GLWidget()
    window.resize(800, 600)
    window.show()
    sys.exit(app.exec_())
