package main

import (
	"fmt"
	"github.com/go-gl/gl/v4.1-core/gl"
	"github.com/go-gl/glfw/v3.3/glfw"
	"log"
	"runtime"
	"strings"
)

const (
	width  = 800
	height = 600

	vertexShaderSource = `#version 410
		in vec3 vp;
		uniform vec3 color;
		out vec3 frag_color;
		void main() {
			gl_Position = vec4(vp, 1.0);
			frag_color = color;
		}
	` + "\x00"

	fragmentShaderSource = `#version 410
		in vec3 frag_color;
		out vec4 out_color;
		void main() {
			out_color = vec4(frag_color, 1.0);
		}
	` + "\x00"
)

var (
	// Буква Е
	letterE = []float32{
		// Вертикальная линия
		-0.9, 0.8, 0,
		-0.9, -0.8, 0,

		// Верхняя горизонтальная линия
		-0.9, 0.8, 0,
		-0.5, 0.8, 0,

		// Средняя горизонтальная линия
		-0.9, 0.0, 0,
		-0.5, 0.0, 0,

		// Нижняя горизонтальная линия
		-0.9, -0.8, 0,
		-0.5, -0.8, 0,
	}

	// Буква В
	letterB = []float32{
		// Вертикальная линия
		-0.8, 0.8, 0,
		-0.8, -0.8, 0,

		// Верхняя дуга
		-0.8, 0.5, 0,
		-0.6, 0.6, 0,
		-0.4, 0.5, 0,
		-0.4, 0.4, 0,
		-0.6, 0.3, 0,
		-0.8, 0.4, 0,

		// Нижняя дуга
		-0.8, -0.5, 0,
		-0.6, -0.6, 0,
		-0.4, -0.5, 0,
		-0.4, -0.4, 0,
		-0.6, -0.3, 0,
		-0.8, -0.4, 0,
	}

	// Буква А
	letterA = []float32{
		// Левый наклон
		-0.8, -0.8, 0,
		-0.5, 0.8, 0,

		// Правый наклон
		-0.5, 0.8, 0,
		-0.2, -0.8, 0,

		// Горизонтальная линия в центре
		-0.65, 0.0, 0,
		-0.35, 0.0, 0,
	}
)

func main() {
	runtime.LockOSThread()

	window := initGlfw()
	defer glfw.Terminate()
	program := initOpenGL()

	vaoE := makeVao(letterE)
	vaoB := makeVao(letterB)
	vaoA := makeVao(letterA)

	for !window.ShouldClose() {
		draw(vaoE, vaoB, vaoA, window, program)
	}
}

func draw(vaoE, vaoB, vaoA uint32, window *glfw.Window, program uint32) {
	gl.Clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
	gl.UseProgram(program)

	// Отрисовка буквы Е
	gl.BindVertexArray(vaoE)
	colorUniform := gl.GetUniformLocation(program, gl.Str("color\x00"))
	gl.Uniform3f(colorUniform, 1.0, 0.0, 0.0) // Красный цвет
	gl.DrawArrays(gl.LINE_STRIP, 0, int32(len(letterE)/3))

	// Отрисовка буквы В
	gl.BindVertexArray(vaoB)
	gl.Uniform3f(colorUniform, 0.0, 1.0, 0.0) // Зеленый цвет
	gl.DrawArrays(gl.LINE_STRIP, 0, int32(len(letterB)/3))

	// Отрисовка буквы А
	gl.BindVertexArray(vaoA)
	gl.Uniform3f(colorUniform, 0.0, 0.0, 1.0) // Синий цвет
	gl.DrawArrays(gl.LINE_STRIP, 0, int32(len(letterA)/3))

	glfw.PollEvents()
	window.SwapBuffers()
}

func initGlfw() *glfw.Window {
	if err := glfw.Init(); err != nil {
		panic(err)
	}
	glfw.WindowHint(glfw.Resizable, glfw.False)
	glfw.WindowHint(glfw.ContextVersionMajor, 4)
	glfw.WindowHint(glfw.ContextVersionMinor, 1)
	glfw.WindowHint(glfw.OpenGLProfile, glfw.OpenGLCoreProfile)
	glfw.WindowHint(glfw.OpenGLForwardCompatible, glfw.True)

	window, err := glfw.CreateWindow(width, height, "Initials E.V.A.", nil, nil)
	if err != nil {
		panic(err)
	}
	window.MakeContextCurrent()

	return window
}

func initOpenGL() uint32 {
	if err := gl.Init(); err != nil {
		panic(err)
	}
	version := gl.GoStr(gl.GetString(gl.VERSION))
	log.Println("OpenGL version", version)

	vertexShader, err := compileShader(vertexShaderSource, gl.VERTEX_SHADER)
	if err != nil {
		panic(err)
	}

	fragmentShader, err := compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER)
	if err != nil {
		panic(err)
	}

	prog := gl.CreateProgram()
	gl.AttachShader(prog, vertexShader)
	gl.AttachShader(prog, fragmentShader)
	gl.LinkProgram(prog)
	return prog
}

func makeVao(points []float32) uint32 {
	var vbo uint32
	gl.GenBuffers(1, &vbo)
	gl.BindBuffer(gl.ARRAY_BUFFER, vbo)
	gl.BufferData(gl.ARRAY_BUFFER, 4*len(points), gl.Ptr(points), gl.STATIC_DRAW)

	var vao uint32
	gl.GenVertexArrays(1, &vao)
	gl.BindVertexArray(vao)
	gl.EnableVertexAttribArray(0)
	gl.BindBuffer(gl.ARRAY_BUFFER, vbo)
	gl.VertexAttribPointer(0, 3, gl.FLOAT, false, 0, nil)

	return vao
}

func compileShader(source string, shaderType uint32) (uint32, error) {
	shader := gl.CreateShader(shaderType)

	csources, free := gl.Strs(source)
	gl.ShaderSource(shader, 1, csources, nil)
	free()
	gl.CompileShader(shader)

	var status int32
	gl.GetShaderiv(shader, gl.COMPILE_STATUS, &status)
	if status == gl.FALSE {
		var logLength int32
		gl.GetShaderiv(shader, gl.INFO_LOG_LENGTH, &logLength)

		log := strings.Repeat("\x00", int(logLength+1))
		gl.GetShaderInfoLog(shader, logLength, nil, gl.Str(log))

		return 0, fmt.Errorf("failed to compile %v: %v", source, log)
	}

	return shader, nil
}
