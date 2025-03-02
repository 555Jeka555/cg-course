import { ElementType } from "./ElementType";

export class Element {
    public readonly id: string;
    public left: number;
    public top: number;
    public readonly width: number;
    public readonly height: number;
    public readonly type: ElementType;

    constructor(id: string, type: ElementType);
    constructor(id: string, type: ElementType, left: number, top: number);
    constructor(id: string, type: ElementType, left: number, top: number, width: number, height: number);
    constructor(id: string, type: ElementType, left: number = 0, top: number = 0, width: number = 0, height: number = 0) {
        this.id = "Elt" + id;
        this.type = type;
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }
}
