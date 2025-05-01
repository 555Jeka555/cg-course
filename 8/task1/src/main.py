from PyQt5.QtWidgets import QApplication, QOpenGLWidget
from PyQt5.QtCore import Qt, QTimer
from OpenGL.GL import *
from OpenGL.GL.shaders import compileShader, compileProgram
import numpy as np

VERTEX_SHARED = """
#version 330 core
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec3 FragPos;
out vec3 Normal;

void main() {
    gl_Position = projection * view * model * vec4(aPos, 1.0);
    FragPos = vec3(model * vec4(aPos, 1.0));
    Normal = mat3(transpose(inverse(model))) * aNormal;
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
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = lightDiffuse * (diff * materialDiffuse);

    // Specular
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), materialShininess);
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

        self.material = Material()
        self.light = Light()
        self.camera_pos = [0.0, 0.0, 3.0]
        self.rotation = [0, 0]

        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update_rotation)
        self.timer.start(16)

    def initializeGL(self):
        glEnable(GL_DEPTH_TEST)
        self.shader = compileProgram(
            compileShader(VERTEX_SHARED, GL_VERTEX_SHADER),
            compileShader(FRAGMENT_SHARED, GL_FRAGMENT_SHADER)
        )

        # Вершины куба с нормалями
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
        self.ebo = glGenBuffers(1)

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
        glUseProgram(self.shader)

        # Матрицы преобразований
        model = np.eye(4, dtype=np.float32)
        model = self.rotate(model, self.rotation[0], [1, 0, 0])
        model = self.rotate(model, self.rotation[1], [0, 1, 0])

        view = np.eye(4, dtype=np.float32)
        view[2, 3] = -3.0  # Отодвигаем камеру

        projection = self.perspective(45, self.width() / self.height(), 0.1, 100)

        # Передача матриц
        glUniformMatrix4fv(glGetUniformLocation(self.shader, "model"), 1, GL_TRUE, model)
        glUniformMatrix4fv(glGetUniformLocation(self.shader, "view"), 1, GL_TRUE, view)
        glUniformMatrix4fv(glGetUniformLocation(self.shader, "projection"), 1, GL_TRUE, projection)

        # Параметры материала
        glUniform3fv(glGetUniformLocation(self.shader, "materialAmbient"), 1, self.material.ambient)
        glUniform3fv(glGetUniformLocation(self.shader, "materialDiffuse"), 1, self.material.diffuse)
        glUniform3fv(glGetUniformLocation(self.shader, "materialSpecular"), 1, self.material.specular)
        glUniform1f(glGetUniformLocation(self.shader, "materialShininess"), self.material.shininess)

        # Параметры света
        glUniform3fv(glGetUniformLocation(self.shader, "lightPos"), 1, self.light.position)
        glUniform3fv(glGetUniformLocation(self.shader, "lightAmbient"), 1, self.light.ambient)
        glUniform3fv(glGetUniformLocation(self.shader, "lightDiffuse"), 1, self.light.diffuse)
        glUniform3fv(glGetUniformLocation(self.shader, "lightSpecular"), 1, self.light.specular)
        glUniform3fv(glGetUniformLocation(self.shader, "viewPos"), 1, self.camera_pos)

        # Отрисовка куба
        glBindVertexArray(self.vao)
        glDrawElements(GL_TRIANGLES, 36, GL_UNSIGNED_INT, None)
        glBindVertexArray(0)

    def update_rotation(self):
        self.rotation[0] = (self.rotation[0] + 0.5) % 360
        self.rotation[1] = (self.rotation[1] + 0.5) % 360
        self.update()

    def rotate(self, matrix, angle, axis):
        angle = np.radians(angle)
        axis = np.array(axis)
        axis = axis / np.linalg.norm(axis)
        c = np.cos(angle)
        s = np.sin(angle)
        t = 1 - c

        rotation = np.array([
            [t*axis[0]*axis[0] + c, t*axis[0]*axis[1] - s*axis[2], t*axis[0]*axis[2] + s*axis[1], 0],
            [t*axis[0]*axis[1] + s*axis[2], t*axis[1]*axis[1] + c, t*axis[1]*axis[2] - s*axis[0], 0],
            [t*axis[0]*axis[2] - s*axis[1], t*axis[1]*axis[2] + s*axis[0], t*axis[2]*axis[2] + c, 0],
            [0, 0, 0, 1]
        ], dtype=np.float32)

        return np.dot(matrix, rotation)

    def perspective(self, fovy, aspect, near, far):
        f = 1.0 / np.tan(np.radians(fovy) / 2.0)
        proj = np.zeros((4, 4), dtype=np.float32)
        proj[0, 0] = f / aspect
        proj[1, 1] = f
        proj[2, 2] = (far + near) / (near - far)
        proj[2, 3] = (2.0 * far * near) / (near - far)
        proj[3, 2] = -1.0

        return proj


if __name__ == '__main__':
    import sys
    app = QApplication(sys.argv)
    window = GLWidget()
    window.resize(800, 600)
    window.show()
    sys.exit(app.exec_())