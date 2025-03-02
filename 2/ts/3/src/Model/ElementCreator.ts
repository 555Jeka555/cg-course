import {ElementType} from "./ElementType.ts";

export class ElementCreator {
    private _elements: Map<string, ElementType[]> = new Map([
        [`${ElementType.EARTH}-${ElementType.AIR}`, [ElementType.DUST]],
        [`${ElementType.AIR}-${ElementType.FIRE}`, [ElementType.ENERGY]],
        [`${ElementType.EARTH}-${ElementType.FIRE}`, [ElementType.LAVA]],
        [`${ElementType.WATER}-${ElementType.EARTH}`, [ElementType.MUD]],
        [`${ElementType.EARTH}-${ElementType.EARTH}`, [ElementType.PRESSURE]],
        [`${ElementType.AIR}-${ElementType.AIR}`, [ElementType.PRESSURE]],
        [`${ElementType.WATER}-${ElementType.AIR}`, [ElementType.RAIN]],
        [`${ElementType.WATER}-${ElementType.WATER}`, [ElementType.SEA]],
        [`${ElementType.WATER}-${ElementType.FIRE}`, [ElementType.STEAM]],
        [`${ElementType.WATER}-${ElementType.ENERGY}`, [ElementType.STEAM]],
        [`${ElementType.AIR}-${ElementType.STEAM}`, [ElementType.CLOUD]],
        [`${ElementType.FIRE}-${ElementType.DUST}`, [ElementType.GUNPOWDER]],
        [`${ElementType.WATER}-${ElementType.SEA}`, [ElementType.OCEAN]],
        [`${ElementType.SEA}-${ElementType.SEA}`, [ElementType.OCEAN]],
        [`${ElementType.EARTH}-${ElementType.RAIN}`, [ElementType.PLANT]],
        [`${ElementType.SEA}-${ElementType.FIRE}`, [ElementType.SALT]],
        [`${ElementType.OCEAN}-${ElementType.FIRE}`, [ElementType.SALT]],
        [`${ElementType.AIR}-${ElementType.LAVA}`, [ElementType.STONE]],
        [`${ElementType.GUNPOWDER}-${ElementType.FIRE}`, [ElementType.EXPLOSION, ElementType.SMOKE]],
        [`${ElementType.FIRE}-${ElementType.STONE}`, [ElementType.METAL]],
        [`${ElementType.STONE}-${ElementType.AIR}`, [ElementType.SAND]],
        [`${ElementType.CLOUD}-${ElementType.ELECTRICITY}`, [ElementType.STORM]],
        [`${ElementType.CLOUD}-${ElementType.ENERGY}`, [ElementType.STORM]],
        [`${ElementType.SEA}-${ElementType.WIND}`, [ElementType.WAVE]],
        [`${ElementType.OCEAN}-${ElementType.WIND}`, [ElementType.WAVE]],
        [`${ElementType.ENERGY}-${ElementType.EXPLOSION}`, [ElementType.ATOMIC_BOMB]],
        [`${ElementType.SEA}-${ElementType.SAND}`, [ElementType.BEACH]],
        [`${ElementType.OCEAN}-${ElementType.SAND}`, [ElementType.BEACH]],
        [`${ElementType.WATER}-${ElementType.SAND}`, [ElementType.BEACH]],
        [`${ElementType.SAND}-${ElementType.SAND}`, [ElementType.DESERT]],
        [`${ElementType.METAL}-${ElementType.ENERGY}`, [ElementType.ELECTRICITY]],
        [`${ElementType.FIRE}-${ElementType.SAND}`, [ElementType.GLASS]],
        [`${ElementType.ELECTRICITY}-${ElementType.SAND}`, [ElementType.GLASS]],
        [`${ElementType.AIR}-${ElementType.WAVE}`, [ElementType.SOUND]],
        [`${ElementType.AIR}-${ElementType.PRESSURE}`, [ElementType.WIND]],
        [`${ElementType.AIR}-${ElementType.ENERGY}`, [ElementType.WIND]],
    ]);

    public createNewElement(first: ElementType, second: ElementType): ElementType[] | null {
        const key1 = `${first}-${second}`;
        const key2 = `${second}-${first}`;

        if (this._elements.has(key1)) {
            return this._elements.get(key1) || null;
        }

        if (this._elements.has(key2)) {
            return this._elements.get(key2) || null;
        }

        return null;
    }
}
