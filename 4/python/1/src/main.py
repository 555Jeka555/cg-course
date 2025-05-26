from PyQt5 import QtWidgets, QtCore, QtGui
from OpenGL.GL import *
from OpenGL.GL.shaders import compileProgram, compileShader
import numpy as np
import math

VERTEX_SHADER = """
#version 330 core
layout(location = 0) in vec3 position;
layout(location = 1) in vec3 normal;
layout(location = 2) in vec3 color;

out vec3 fragNormal;
out vec3 fragColor;
out vec3 fragPos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    fragNormal = mat3(transpose(inverse(model))) * normal;
    fragColor = color;
    fragPos = vec3(model * vec4(position, 1.0));
    gl_Position = projection * view * model * vec4(position, 1.0);
}
"""

FRAGMENT_SHADER = """
#version 330 core
in vec3 fragNormal;
in vec3 fragColor;
in vec3 fragPos;

out vec4 outColor;

uniform vec3 lightPos;
uniform vec3 viewPos;
uniform vec3 lightColor;

void main()
{
    // Ambient
    float ambientStrength = 0.2;
    vec3 ambient = ambientStrength * lightColor;

    // Diffuse
    vec3 norm = normalize(fragNormal);
    vec3 lightDir = normalize(lightPos - fragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;

    // Specular
    float specularStrength = 0.5;
    vec3 viewDir = normalize(viewPos - fragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32);
    vec3 specular = specularStrength * spec * lightColor;

    vec3 result = (ambient + diffuse + specular) * fragColor;
    outColor = vec4(result, 1.0);
}
"""


class GLWidget(QtWidgets.QOpenGLWidget):
    def __init__(self, parent=None):
        super(GLWidget, self).__init__(parent)
        self.setWindowTitle("Task1")
        self.setGeometry(300, 300, 800, 600)

        self.rotation_x = 0.0
        self.rotation_y = 0.0
        self.scale = 1.0

        self.view_matrix = np.identity(4, dtype=np.float32)
        self.projection_matrix = np.identity(4, dtype=np.float32)

        self.last_pos = QtCore.QPoint()
        self.setMouseTracking(True)

        self.vertices = []
        self.normals = []
        self.colors = []
        self.indices = []

    def initializeGL(self):
        glClearColor(0.2, 0.2, 0.2, 1.0)
        glEnable(GL_DEPTH_TEST)

        self.program = compileProgram(
            compileShader(VERTEX_SHADER, GL_VERTEX_SHADER),
            compileShader(FRAGMENT_SHADER, GL_FRAGMENT_SHADER)
        )

        self.generate_tetrahedron(1.0)
        self.setup_buffers()
        self.update_view_matrix()

    def generate_tetrahedron(self, size):
        # Tetrahedron vertices (4 points)
        s = size
        self.vertices = [
            [s, s, s],  # 0 - top front right
            [-s, -s, s],  # 1 - bottom front left
            [-s, s, -s],  # 2 - top back left
            [s, -s, -s]  # 3 - bottom back right
        ]

        # Tetrahedron faces (4 triangles)
        self.indices = [
            0, 1, 2,  # Front face
            0, 3, 1,  # Bottom face
            0, 2, 3,  # Left face
            1, 3, 2  # Back face
        ]

        # Calculate normals for each face
        face_normals = []
        for i in range(0, len(self.indices), 3):
            v0 = np.array(self.vertices[self.indices[i]])
            v1 = np.array(self.vertices[self.indices[i + 1]])
            v2 = np.array(self.vertices[self.indices[i + 2]])

            normal = np.cross(v1 - v0, v2 - v0)
            normal = normal / np.linalg.norm(normal)
            face_normals.append(normal)

        # Assign normals to vertices (each vertex gets average of adjacent face normals)
        self.normals = [np.zeros(3) for _ in range(len(self.vertices))]
        vertex_face_count = [0] * len(self.vertices)

        for face_idx in range(len(face_normals)):
            for i in range(3):
                vertex_idx = self.indices[face_idx * 3 + i]
                self.normals[vertex_idx] += face_normals[face_idx]
                vertex_face_count[vertex_idx] += 1

        # Normalize the normals
        for i in range(len(self.normals)):
            if vertex_face_count[i] > 0:
                self.normals[i] = self.normals[i] / vertex_face_count[i]
                self.normals[i] = self.normals[i] / np.linalg.norm(self.normals[i])

        # Assign colors to each vertex
        self.colors = [
            [1.0, 0.0, 0.0],  # Red
            [0.0, 1.0, 0.0],  # Green
            [0.0, 0.0, 1.0],  # Blue
            [1.0, 1.0, 0.0]  # Yellow
        ]

    def setup_buffers(self):
        self.vao = glGenVertexArrays(1)
        glBindVertexArray(self.vao)

        # Vertex buffer
        self.vbo = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, self.vbo)
        glBufferData(GL_ARRAY_BUFFER,
                     np.array(self.vertices, dtype=np.float32),
                     GL_STATIC_DRAW)
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, None)
        glEnableVertexAttribArray(0)

        # Normal buffer
        self.nbo = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, self.nbo)
        glBufferData(GL_ARRAY_BUFFER,
                     np.array(self.normals, dtype=np.float32),
                     GL_STATIC_DRAW)
        glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 0, None)
        glEnableVertexAttribArray(1)

        # Color buffer
        self.cbo = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, self.cbo)
        glBufferData(GL_ARRAY_BUFFER,
                     np.array(self.colors, dtype=np.float32),
                     GL_STATIC_DRAW)
        glVertexAttribPointer(2, 3, GL_FLOAT, GL_FALSE, 0, None)
        glEnableVertexAttribArray(2)

        # Index buffer
        self.ibo = glGenBuffers(1)
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, self.ibo)
        glBufferData(GL_ELEMENT_ARRAY_BUFFER,
                     np.array(self.indices, dtype=np.uint32),
                     GL_STATIC_DRAW)

        glBindVertexArray(0)

    def resizeGL(self, w, h):
        glViewport(0, 0, w, h)
        aspect = w / h if h > 0 else 1.0
        self.projection_matrix = self.perspective(45, aspect, 0.1, 100)

    def paintGL(self):
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
        glUseProgram(self.program)

        self.update_model_matrix()

        # Set matrices
        glUniformMatrix4fv(glGetUniformLocation(self.program, "model"),
                           1, GL_TRUE, self.model_matrix)
        glUniformMatrix4fv(glGetUniformLocation(self.program, "view"),
                           1, GL_TRUE, self.view_matrix)
        glUniformMatrix4fv(glGetUniformLocation(self.program, "projection"),
                           1, GL_TRUE, self.projection_matrix)

        # Set lighting parameters
        light_pos = np.array([5.0, 5.0, 5.0], dtype=np.float32)
        view_pos = np.array([0.0, 0.0, 3.0], dtype=np.float32)
        light_color = np.array([1.0, 1.0, 1.0], dtype=np.float32)

        glUniform3fv(glGetUniformLocation(self.program, "lightPos"), 1, light_pos)
        glUniform3fv(glGetUniformLocation(self.program, "viewPos"), 1, view_pos)
        glUniform3fv(glGetUniformLocation(self.program, "lightColor"), 1, light_color)

        # Draw filled tetrahedron
        glBindVertexArray(self.vao)
        glDrawElements(GL_TRIANGLES, len(self.indices), GL_UNSIGNED_INT, None)

        # Draw edges in black
        glUniform3fv(glGetUniformLocation(self.program, "lightColor"), 1, np.array([0.0, 0.0, 0.0], dtype=np.float32))
        glPolygonMode(GL_FRONT_AND_BACK, GL_LINE)
        glLineWidth(2.0)
        glDrawElements(GL_TRIANGLES, len(self.indices), GL_UNSIGNED_INT, None)
        glPolygonMode(GL_FRONT_AND_BACK, GL_FILL)

        glBindVertexArray(0)

    def update_model_matrix(self):
        self.model_matrix = np.identity(4, dtype=np.float32)
        self.model_matrix = self.scale_matrix(self.scale) @ self.model_matrix
        self.model_matrix = self.rotate_y(self.rotation_y) @ self.model_matrix
        self.model_matrix = self.rotate_x(self.rotation_x) @ self.model_matrix

    def update_view_matrix(self):
        self.view_matrix = self.look_at(0, 0, 3, 0, 0, 0, 0, 1, 0)

    def look_at(self, eye_x, eye_y, eye_z, center_x, center_y, center_z, up_x, up_y, up_z):
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
        self.scale = max(0.1, min(10.0, self.scale + delta * 0.1))
        self.update()

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


if __name__ == "__main__":
    app = QtWidgets.QApplication([])
    widget = GLWidget()
    widget.show()
    app.exec_()