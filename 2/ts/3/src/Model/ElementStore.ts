import { ElementType } from "./ElementType.ts";
import { Element } from "./Element.ts";
import { ElementCreator } from "./ElementCreator.ts";

export class ElementStore {
    private _elementsCreator: ElementCreator = new ElementCreator();
    private _elements: Element[] = [];
    private _openedElts: ElementType[] = [ElementType.WATER, ElementType.FIRE, ElementType.AIR, ElementType.EARTH];
    private _count: number = 0;

    public Width: number;
    public Height: number;
    public ElementWidth: number;
    public ElementHeight: number;

    // public OnCreateElement: (id: string, type: ElementType, left: number, top: number) => void = () => {};
    // public OnMoveElement: (id: string, left: number, top: number) => void = () => {};
    // public OnRemoveElement: (id: string) => void = () => {};
    // public OnElementOpened: (type: ElementType) => void = () => {};

    constructor(width: number, height: number, elementWidth: number, elementHeight: number) {
        this.Width = width;
        this.Height = height;
        this.ElementWidth = elementWidth;
        this.ElementHeight = elementHeight;

        let centerX = (this.Width - elementWidth) / 2;
        let centerY = (this.Height - elementHeight) / 2;

        this._elements.push({
            id: (this._count++).toString(),
            type: ElementType.FIRE,
            left: centerX - elementWidth,
            top: centerY,
            width: elementWidth,
            height: elementHeight
        });

        this._elements.push({
            id: (this._count++).toString(),
            type: ElementType.WATER,
            left: centerX + elementWidth,
            top: centerY,
            width: elementWidth,
            height: elementHeight
        });

        this._elements.push({
            id: (this._count++).toString(),
            type: ElementType.EARTH,
            left: centerX,
            top: centerY - elementHeight,
            width: elementWidth,
            height: elementHeight
        });

        this._elements.push({
            id: (this._count++).toString(),
            type: ElementType.AIR,
            left: centerX,
            top: centerY + elementHeight,
            width: elementWidth,
            height: elementHeight
        });
    }

    getOpenedElts(): ElementType[] {
        return this._openedElts;
    }

    getElements(): Element[] {
        return this._elements;
    }

    public getCount(): number {
        return this._elements.length;
    }

    public addElement(type: ElementType): void {
        if (!this._openedElts.includes(type)) {
            throw new Error("This type is not created");
        }

        let left = (this.Width - this.ElementWidth) / 2;
        let top = (this.Height - this.ElementHeight) / 2;
        const newElement: Element = {
            id: (this._count++).toString(),
            type,
            left,
            top,
            width: this.ElementWidth,
            height: this.ElementHeight
        };

        this._elements.push(newElement);
        // this.OnCreateElement(newElement.id, type, left, top);
    }

    public setNewPosition(id: string, x: number, y: number): void {
        const element = this.getElement(id);

        if (x < 0 || y < 0 || x + this.ElementWidth > this.Width || y + this.ElementHeight > this.Height) {
            throw new Error("Element position is out of canvas");
        }

        element.left = x;
        element.top = y;

        // this.OnMoveElement(id, x, y);
        this.checkAndCombineElements(element);
    }

    public remove(id: string): void {
        const element = this.tryGetElement(id);
        if (element) {
            this._elements = this._elements.filter(el => el.id !== id);
            // this.OnRemoveElement(id);
        }
    }

    private getElement(id: string): Element {
        const element = this.tryGetElement(id);
        if (!element) {
            throw new Error("Unknown id");
        }
        return element;
    }

    private tryGetElement(id: string): Element | undefined {
        return this._elements.find(e => e.id === id);
    }

    private checkAndCombineElements(element: Element): void {
        for (const item of this._elements) {
            if (item.id === element.id) {
                continue;
            }

            if (
                this.checkIsPointInArea(item.left, item.top, element.left, element.left + element.width, element.top, element.top + element.height) ||
                this.checkIsPointInArea(item.left + item.width, item.top, element.left, element.left + element.width, element.top, element.top + element.height) ||
                this.checkIsPointInArea(item.left, item.top + item.height, element.left, element.left + element.width, element.top, element.top + element.height) ||
                this.checkIsPointInArea(item.left + item.width, item.top + item.height, element.left, element.left + element.width, element.top, element.top + element.height)
            ) {
                const newElts = this._elementsCreator.createNewElement(element.type, item.type);
                if (newElts && newElts.length > 0) {
                    this.createElement(element, item, newElts);
                    return;
                }
            }
        }
    }

    private createElement(first: Element, second: Element, typesOfNew: ElementType[]): void {
        const stepX = (first.left - second.left) / (typesOfNew.length + 1);
        const stepY = (first.top - second.top) / (typesOfNew.length + 1);

        let currentX = first.left + stepX;
        let currentY = first.top + stepY;

        const toDeleteIds: string[] = [];

        for (let i = 0; i < 2; i++) {
            const toDelete = i === 0 ? first : second;
            toDeleteIds.push(toDelete.id);
            this._elements = this._elements.filter(el => el.id !== toDelete.id);
        }

        const newTypes: ElementType[] = [];
        for (let i = 0; i < typesOfNew.length; i++) {
            if (!this._openedElts.includes(typesOfNew[i])) {
                this._openedElts.push(typesOfNew[i]);
                newTypes.push(typesOfNew[i]);
            }

            this._elements.push({
                id: (this._count++).toString(),
                type: typesOfNew[i],
                left: currentX,
                top: currentY,
                width: this.ElementWidth,
                height: this.ElementHeight
            });

            currentX += stepX;
            currentY += stepY;
        }

        for (const id of toDeleteIds) {
            // this.OnRemoveElement(id);
        }

        for (const type of newTypes) {
            // this.OnElementOpened(type);
        }

        for (let i = 0; i < typesOfNew.length; i++) {
            const element = this._elements[this._elements.length - i - 1];
            // this.OnCreateElement(element.id, element.type, element.left, element.top);
        }
    }

    private checkIsPointInArea(x: number, y: number, left: number, right: number, top: number, bottom: number): boolean {
        return left <= x && x <= right && top <= y && y <= bottom;
    }
}
