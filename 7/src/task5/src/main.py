import sys
from PyQt5.QtWidgets import QApplication, QMainWindow, QOpenGLWidget
from PyQt5.QtCore import QTimer
from OpenGL.GL import *
from OpenGL.GLU import gluPerspective

VERTEX_SHADER = """
#version 330 core
layout (location = 0) in vec2 aPos;
uniform float radius;

void main()
{
    gl_Position = vec4(aPos, 0.0, 1.0);
}
"""

GEOMETRY_SHADER = """
#version 330 core
layout (points) in;
layout (line_strip, max_vertices=120) out;

uniform float radius;

void main()
{
    for (int i = 0; i <= 120; i++)
    {
        float angle = 6.2831853 * i / 100.0;
        vec2 position = vec2(radius * cos(angle), radius * sin(angle));
        gl_Position = vec4(position, 0.0, 1.0);
        EmitVertex();
    }
    EndPrimitive();
}
"""

FRAGMENT_SHADER = """
#version 330 core
out vec4 FragColor;

void main()
{
    FragColor = vec4(1.0, 0.5, 0.2, 1.0);
}
"""


class App(QOpenGLWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update)
        self.timer.start(10)
        self.shader_program = None
        self.radius = 0.3

    def initializeGL(self):
        glClearColor(0.2, 0.2, 0.2, 1.0)
        self.shader_program = self.compile_shaders()

    def resizeGL(self, w, h):
        glViewport(0, 0, w, h)
        glMatrixMode(GL_PROJECTION)
        glLoadIdentity()
        gluPerspective(45, w / h, 0.1, 100.0)
        glMatrixMode(GL_MODELVIEW)

    def paintGL(self):
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
        if self.shader_program is not None:
            glUseProgram(self.shader_program)
            glUniform1f(glGetUniformLocation(self.shader_program, "radius"), self.radius)
            glBegin(GL_POINTS)
            glColor3f(1.0, 1.0, 1.0)
            glVertex2f(0.0, 0.0)
            glEnd()

    def compile_shaders(self):
        vertex_shader = glCreateShader(GL_VERTEX_SHADER)
        glShaderSource(vertex_shader, VERTEX_SHADER)
        glCompileShader(vertex_shader)
        if not glGetShaderiv(vertex_shader, GL_COMPILE_STATUS):
            info_log = glGetShaderInfoLog(vertex_shader)
            print("Vertex shader compilation failed:", info_log.decode())
            return None

        geometry_shader = glCreateShader(GL_GEOMETRY_SHADER)
        glShaderSource(geometry_shader, GEOMETRY_SHADER)
        glCompileShader(geometry_shader)
        if not glGetShaderiv(geometry_shader, GL_COMPILE_STATUS):
            info_log = glGetShaderInfoLog(geometry_shader)
            print("Geometry shader compilation failed:", info_log.decode())
            return None

        fragment_shader = glCreateShader(GL_FRAGMENT_SHADER)
        glShaderSource(fragment_shader, FRAGMENT_SHADER)
        glCompileShader(fragment_shader)
        if not glGetShaderiv(fragment_shader, GL_COMPILE_STATUS):
            info_log = glGetShaderInfoLog(fragment_shader)
            print("Fragment shader compilation failed:", info_log.decode())
            return None

        shader_program = glCreateProgram()
        glAttachShader(shader_program, vertex_shader)
        glAttachShader(shader_program, geometry_shader)
        glAttachShader(shader_program, fragment_shader)
        glLinkProgram(shader_program)
        if not glGetProgramiv(shader_program, GL_LINK_STATUS):
            info_log = glGetProgramInfoLog(shader_program)
            print("Shader program linking failed:", info_log.decode())
            return None

        glDeleteShader(vertex_shader)
        glDeleteShader(geometry_shader)
        glDeleteShader(fragment_shader)

        return shader_program


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setGeometry(100, 100, 800, 800)
        self.setWindowTitle("Circle with geometrical shader")
        self.glWidget = App(self)
        self.setCentralWidget(self.glWidget)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    mainWindow = MainWindow()
    mainWindow.show()
    sys.exit(app.exec_())
