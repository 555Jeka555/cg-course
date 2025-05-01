import sys
from typing import Optional, List, Any
from PyQt5.QtWidgets import QApplication, QMainWindow, QOpenGLWidget
from PyQt5.QtCore import QTimer
from OpenGL.GL import *
from OpenGL.GLU import gluPerspective

VERTEX_SHADER = """
#version 330 core                   // версия GLSL
layout (location = 0) in vec2 aPos; // 2D координаты вершин

void main()
{
    gl_Position = vec4(aPos, 0.0, 1.0);
}
"""

# TODO Доработать так чтобы при ресайзе сохранялось соотношение сторон
GEOMETRY_SHADER = """
#version 330 core
layout (points) in;                         // Принимает точки
layout (line_strip, max_vertices=120) out;  // Выводит линии, line_strip соединяет вершины в линию, делая круг
uniform float radius;
uniform vec2 pointPosition;

void main()
{
    for (int i = 0; i <= 120; i++)
    {
        float angle = 6.2831853 * i / 100.0;  // 2π*i/100 (полный круг)
        
        vec2 offset = vec2(radius * cos(angle), radius * sin(angle));  // Преобразует полярные координаты радиус и угол в декартовы координаты x, y
        
        gl_Position = vec4(pointPosition + offset, 0.0, 1.0);   // Устанавливает финальную позицию вершины
        
        EmitVertex();  // Генерирует вершину
    }
    EndPrimitive();  // Завершает примитив
}
"""

FRAGMENT_SHADER = """
#version 330 core
out vec4 gl_FragColor;

void main()
{
    gl_FragColor = vec4(1.0, 0.5, 0.2, 1.0);
}
"""


class Circle():
    def __init__(self, radius: float, pointPosition: List[float]) -> None:
        self.radius = radius
        self.pointPosition = pointPosition


class App(QOpenGLWidget):
    def __init__(self, parent: Optional[QMainWindow] = None) -> None:
        super().__init__(parent)
        self.timer: QTimer = QTimer(self)
        self.timer.timeout.connect(self.update)
        self.timer.start(10)
        self.shader_program: Optional[int] = None

        self.circles = [
            Circle(0.3, [0.5, -0.5]),
            Circle(0.5, [0.5, 0.5])
        ]

    def initializeGL(self) -> None:
        glClearColor(0.2, 0.2, 0.2, 1.0)
        self.shader_program = self.compile_shaders()

    def paintGL(self) -> None:
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)

        if self.shader_program is not None:
            glUseProgram(self.shader_program)
            for circle in self.circles:
                glUniform1f(glGetUniformLocation(self.shader_program, "radius"), circle.radius)
                glUniform2f(glGetUniformLocation(self.shader_program, "pointPosition"),
                            circle.pointPosition[0], circle.pointPosition[1])

                glBegin(GL_POINTS)
                glVertex2f(0.0, 0.0)
                glEnd()

    def compile_shaders(self) -> Optional[int]:
        vertex_shader: Optional[int] = self._compile_vertex_shader()
        geometry_shader: Optional[int] = self._compile_geometry_shader()
        fragment_shader: Optional[int] = self._compile_fragment_shader()

        if not all([vertex_shader, geometry_shader, fragment_shader]):
            return None

        shader_program: Optional[int] = self._create_shader_program(
            vertex_shader, geometry_shader, fragment_shader
        )

        self._cleanup_shaders(vertex_shader, geometry_shader, fragment_shader)

        return shader_program

    def _compile_vertex_shader(self) -> Optional[int]:
        return self._compile_shader(GL_VERTEX_SHADER, VERTEX_SHADER, "Vertex")

    def _compile_geometry_shader(self) -> Optional[int]:
        return self._compile_shader(GL_GEOMETRY_SHADER, GEOMETRY_SHADER, "Geometry")

    def _compile_fragment_shader(self) -> Optional[int]:
        return self._compile_shader(GL_FRAGMENT_SHADER, FRAGMENT_SHADER, "Fragment")

    def _compile_shader(
            self,
            shader_type: int,
            source: str,
            shader_name: str
    ) -> Optional[int]:
        shader: int = glCreateShader(shader_type)
        glShaderSource(shader, source)
        glCompileShader(shader)

        if not glGetShaderiv(shader, GL_COMPILE_STATUS):
            info_log: bytes = glGetShaderInfoLog(shader)
            print(f"{shader_name} shader compilation failed:", info_log.decode())
            return None

        return shader

    def _create_shader_program(
            self,
            vertex_shader: int,
            geometry_shader: int,
            fragment_shader: int
    ) -> Optional[int]:
        program: int = glCreateProgram()

        glAttachShader(program, vertex_shader)
        glAttachShader(program, geometry_shader)
        glAttachShader(program, fragment_shader)

        glLinkProgram(program)

        if not glGetProgramiv(program, GL_LINK_STATUS):
            info_log: bytes = glGetProgramInfoLog(program)
            print("Shader program linking failed:", info_log.decode())
            return None

        return program

    def _cleanup_shaders(
            self,
            vertex_shader: int,
            geometry_shader: int,
            fragment_shader: int
    ) -> None:
        glDeleteShader(vertex_shader)
        glDeleteShader(geometry_shader)
        glDeleteShader(fragment_shader)


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("Circle with geometrical shader")
        self.app = App(self)
        self.setCentralWidget(self.app)
        self.resize(800, 800)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    mainWindow = MainWindow()
    mainWindow.show()
    sys.exit(app.exec_())
