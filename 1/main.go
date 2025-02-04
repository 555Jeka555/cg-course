package main

import (
	"fmt"
	"github.com/go-gl/gl/v4.1-core/gl"
	"github.com/go-gl/glfw/v3.3/glfw"
	"log"
	"math"
	"runtime"
	"strings"
)

const (
	width  = 800
	height = 600

	vertexShaderSource = `
    #version 410
    in vec3 vp;
    uniform vec2 pos;
    void main() {
      gl_Position = vec4(vp.x + pos.x, vp.y + pos.y, vp.z, 1.0);
    }
  ` + "\x00"

	fragmentShaderSource = `
    #version 410
    uniform vec3 color;
    out vec4 frag_colour;
    void main() {
      frag_colour = vec4(color, 1.0);
    }
  ` + "\x00"
)

var (
	letterE = []float32{
		-0.10, 0.10, 0, // Левый верхний угол
		-0.10, -0.10, 0, // Левый нижний угол
		0.10, -0.10, 0, // Правый нижний угол
		0.10, -0.05, 0, // Правый нижний угол (верхняя часть)
		-0.10, -0.05, 0, // Левый нижний угол (верхняя часть)
		-0.10, 0.05, 0, // Левый верхний угол (нижняя часть)
		0.10, 0.05, 0, // Правый верхний угол (нижняя часть)
		0.10, 0.10, 0, // Правый верхний угол
	}

	letterV = []float32{
		-0.10, 0.10, 0, // Левый верхний угол
		0.00, -0.10, 0, // Низ центра
		0.10, 0.10, 0, // Правый верхний угол
	}

	letterA = []float32{
		-0.10, -0.10, 0, // Левый нижний угол
		0.00, 0.10, 0, // Верхний центр
		0.10, -0.10, 0, // Правый нижний угол
		0.00, 0.00, 0, // Центр
	}
)

type Letter struct {
	vao       uint32
	position  [2]float32
	color     [3]float32
	speed     float32
	direction int
}

func main() {
	runtime.LockOSThread()

	window := initGlfw()
	defer glfw.Terminate()
	program := initOpenGL()

	letters := []Letter{
		{makeVao(letterE), [2]float32{-0.5, 0}, [3]float32{1.0, 0.0, 0.0}, 0.0005, 1},
		{makeVao(letterV), [2]float32{0, 0}, [3]float32{0.0, 1.0, 0.0}, 0.0007, 1},
		{makeVao(letterA), [2]float32{0.5, 0}, [3]float32{0.0, 0.0, 1.0}, 0.0003, 1},
	}

	for !window.ShouldClose() {
		draw(letters, window, program)
		update(letters)
	}
}

func draw(letters []Letter, window *glfw.Window, program uint32) {
	gl.Clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
	gl.UseProgram(program)

	posAttrib := gl.GetUniformLocation(program, gl.Str("pos\x00"))
	colorAttrib := gl.GetUniformLocation(program, gl.Str("color\x00"))

	for _, letter := range letters {
		gl.Uniform2fv(posAttrib, 1, &letter.position[0])
		gl.Uniform3fv(colorAttrib, 1, &letter.color[0])
		gl.BindVertexArray(letter.vao)
		gl.DrawArrays(gl.LINE_LOOP, 0, int32(len(letterE)/3))
	}

	glfw.PollEvents()
	window.SwapBuffers()
}

func update(letters []Letter) {
	for i := range letters {
		letters[i].position[1] += letters[i].speed * float32(letters[i].direction)
		if math.Abs(float64(letters[i].position[1])) > 0.5 {
			letters[i].direction *= -1
		}
	}
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

	window, err := glfw.CreateWindow(width, height, "Jumping Letters", nil, nil)
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
