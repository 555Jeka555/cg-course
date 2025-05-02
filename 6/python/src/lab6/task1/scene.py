from model import *


class Scene:
    def __init__(self, app):
        self.app = app
        self.objects = []
        self.load()
        # skybox
        self.skybox = AdvancedSkyBox(app)

    def add_object(self, obj):
        self.objects.append(obj)

    def load(self):
        app = self.app
        add = self.add_object

        # floor
        n, s = 20, 2
        for x in range(-n, n, s):
            for z in range(-n, n, s):
                add(Cube(app, pos=(x, -s, z)))

        # columns
        for i in range(8):
            add(Cube(app, pos=(-10, i * s, -9 + i), tex_id=2))
            add(Cube(app, pos=(-10, i * s, 5 - i), tex_id=1))

        # chessboard
        add(Chessboard(app, pos=(30, 0, -10)))

        # black king at f8
        add(BlackKing(app, pos=(30, 2, -13), scale=(0.8, 0.8, 0.8)))

        # white queen at b7
        add(WhiteQueen(app, pos=(20.5, 2, -34), scale=(0.8, 0.8, 0.8)))

        # white pawn at c6
        add(WhitePawn(app, pos=(36, 2, -26), scale=(0.8, 0.8, 0.8)))

        # white pawn at e6
        add(WhitePawn(app, pos=(45, 2, -26), scale=(0.8, 0.8, 0.8)))

        # white king at e1
        add(WhiteKing(app, pos=(30, 2, -7), scale=(0.8, 0.8, 0.8)))

        # black rook at h8
        add(BlackRook(app, pos=(32.5, 2, -12), scale=(0.8, 0.8, 0.8)))

        # black knight at e4
        add(BlackKnight(app, pos=(23, 2, 5), scale=(0.8, 0.8, 0.8)))

        # black knight at f4
        add(BlackKnight(app, pos=(18, 2, 5), scale=(0.8, 0.8, 0.8)))

        # moving cube
        self.moving_cube = MovingCube(app, pos=(0, 6, 8), scale=(2, 2, 2), tex_id=0)
        add(self.moving_cube)

        self.moving_king = MovingBlackKingBar(app, pos=(20, 0, -10))
        add(self.moving_king)

    def update(self):
        self.moving_cube.rot.xyz = self.app.time
        self.moving_king.rot.xyz = self.app.time
