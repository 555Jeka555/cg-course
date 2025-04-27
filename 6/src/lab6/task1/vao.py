from vbo import VBO
from shader_program import ShaderProgram


class VAO:
    def __init__(self, ctx):
        self.ctx = ctx
        self.vbo = VBO(ctx)
        self.program = ShaderProgram(ctx)
        self.vaos = dict()

        # cube vao
        self.vaos['cube'] = self.get_vao(
            program=self.program.programs['default'],
            vbo = self.vbo.vbos['cube'])

        # shadow cube vao
        self.vaos['shadow_cube'] = self.get_vao(
            program=self.program.programs['shadow_map'],
            vbo = self.vbo.vbos['cube'])

        # vaos
        # chessboard
        self.vaos['chessboard'] = self.get_vao(
            program=self.program.programs['default'],
            vbo=self.vbo.vbos['chessboard'])

        # shadow chessboard
        self.vaos['shadow_chessboard'] = self.get_vao(
            program=self.program.programs['shadow_map'],
            vbo=self.vbo.vbos['chessboard'])

        # black king
        self.vaos['black_king'] = self.get_vao(
            program=self.program.programs['default'],
            vbo=self.vbo.vbos['black_king'])

        # shadow black king
        self.vaos['shadow_black_king'] = self.get_vao(
            program=self.program.programs['shadow_map'],
            vbo=self.vbo.vbos['black_king'])

        # white queen
        self.vaos['white_queen'] = self.get_vao(
            program=self.program.programs['default'],
            vbo=self.vbo.vbos['white_queen'])

        # shadow white queen
        self.vaos['shadow_white_queen'] = self.get_vao(
            program=self.program.programs['shadow_map'],
            vbo=self.vbo.vbos['white_queen'])

        # white pawn
        self.vaos['white_pawn'] = self.get_vao(
            program=self.program.programs['default'],
            vbo=self.vbo.vbos['white_pawn'])

        # shadow white pawn
        self.vaos['shadow_white_pawn'] = self.get_vao(
            program=self.program.programs['shadow_map'],
            vbo=self.vbo.vbos['white_pawn'])

        # white_king
        self.vaos['white_king'] = self.get_vao(
            program=self.program.programs['default'],
            vbo=self.vbo.vbos['white_king'])

        # shadow white_king
        self.vaos['shadow_white_king'] = self.get_vao(
            program=self.program.programs['shadow_map'],
            vbo=self.vbo.vbos['white_king'])

        # black rook
        self.vaos['black_rook'] = self.get_vao(
            program=self.program.programs['default'],
            vbo=self.vbo.vbos['black_rook'])

        # shadow black rook
        self.vaos['shadow_black_rook'] = self.get_vao(
            program=self.program.programs['shadow_map'],
            vbo=self.vbo.vbos['black_rook'])

        # black knight
        self.vaos['black_knight'] = self.get_vao(
            program=self.program.programs['default'],
            vbo=self.vbo.vbos['black_knight'])

        # shadow black knight
        self.vaos['shadow_black_knight'] = self.get_vao(
            program=self.program.programs['shadow_map'],
            vbo=self.vbo.vbos['black_knight'])

        # skybox vao
        self.vaos['skybox'] = self.get_vao(
            program=self.program.programs['skybox'],
            vbo=self.vbo.vbos['skybox'])

        # advanced_skybox vao
        self.vaos['advanced_skybox'] = self.get_vao(
            program=self.program.programs['advanced_skybox'],
            vbo=self.vbo.vbos['advanced_skybox'])

    def get_vao(self, program, vbo):
        vao = self.ctx.vertex_array(program, [(vbo.vbo, vbo.format, *vbo.attribs)], skip_errors=True)
        return vao

    def destroy(self):
        self.vbo.destroy()
        self.program.destroy()