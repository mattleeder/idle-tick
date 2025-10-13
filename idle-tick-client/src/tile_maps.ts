interface TileInfo {
    isPathable: boolean
}

interface TileMapObject {
    cols: number
    rows: number
    tileSize: number
    tiles: number[]
    tileInfo: {[key: number]: TileInfo}
    source: string
}

export class TileMap {
    cols: number;
    rows: number;
    tileSize: number;
    tiles: number[];
    tileInfo: {[key: number]: TileInfo}
    source: string;

    constructor(cols: number, rows: number, tileSize: number, tiles: number[], tileInfo: {[key: number]: TileInfo}, source: string) {
        this.cols = cols
        this.rows = rows
        this.tileSize = tileSize
        this.tiles = tiles
        this.tileInfo = tileInfo
        this.source = source
    }

    static fromObject(tileMapObject: TileMapObject): TileMap {
        return new TileMap(
            tileMapObject.cols,
            tileMapObject.rows,
            tileMapObject.tileSize,
            tileMapObject.tiles,
            tileMapObject.tileInfo,
            tileMapObject.source
        )
    }

    getTile(col: number, row: number): number {
        if (col > this.cols - 1 || col < 0 || row > this.rows - 1 || row < 0) {
            return 0
        }
        return this.tiles[row * this.cols + col]
    }

    canPath(tile: number): boolean {
        const tileInfo = this.tileInfo[tile]
        if (tileInfo === undefined) {
            return false
        }

        return tileInfo.isPathable
    }
}

const fireCaveTileMapObject: TileMapObject = {
    cols: 10,
    rows: 10,
    tileSize: 64,
    tiles: [
        5, 3, 3, 3, 3, 3, 3, 3, 3, 6,
        1, 9, 9, 9, 9, 9, 9, 9, 9, 2,
        1, 9, 9, 9, 9, 9, 9, 9, 9, 2,
        1, 9, 9, 10, 11, 9, 9, 9, 9, 2,
        1, 9, 9, 12, 13, 9, 9, 9, 9, 2,
        1, 9, 9, 9, 9, 10, 11, 9, 9, 2,
        1, 9, 9, 9, 9, 12, 13, 9, 9, 2,
        1, 9, 9, 9, 9, 9, 9, 9, 9, 2,
        1, 9, 9, 9, 9, 9, 9, 9, 9, 2,
        7, 4, 4, 4, 4, 4, 4, 4, 4, 8,
    ],
    tileInfo: {
        1: {isPathable: true},
        2: {isPathable: true},
        3: {isPathable: true},
        4: {isPathable: true},
        5: {isPathable: true},
        6: {isPathable: true},
        7: {isPathable: true},
        8: {isPathable: true},
        9: {isPathable: true},
        10: {isPathable: false},
        11: {isPathable: false},
        12: {isPathable: false},
        13: {isPathable: false},
    },
    source: "src/assets/firecavetilemap.png",
}

export const fireCaveTileMap = TileMap.fromObject(fireCaveTileMapObject)

const testCaveTileMapObject: TileMapObject = {
    cols: 29,
    rows: 30,
    tileSize: 64,
    tiles: [
        5,  3,  3,  3,  3,     3,  3,  3,  3,  3,     3,  3,  3,  3,  3,     3,  3,  3,  3,  3,     3,  3,  3,  3,  3,     3,  3,  3,  6,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,

        
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9, 10, 10, 11,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9, 10, 10, 11,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        10, 10, 11, 9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9, 12, 13, 13,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        10, 10, 11, 9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        12, 13, 13, 9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,


        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,


        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,


        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     10, 10, 11, 9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     10, 10, 11, 9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     12, 13, 13, 9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,


        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        1,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  9,  9,     9,  9,  9,  2,
        7,  4,  4,  4,  4,     4,  4,  4,  4,  4,     4,  4,  4,  4,  4,     4,  4,  4,  4,  4,     4,  4,  4,  4,  4,     4,  4,  4,  8,
    ],
    tileInfo: {
        1: {isPathable: true},
        2: {isPathable: true},
        3: {isPathable: true},
        4: {isPathable: true},
        5: {isPathable: true},
        6: {isPathable: true},
        7: {isPathable: true},
        8: {isPathable: true},
        9: {isPathable: true},
        10: {isPathable: false},
        11: {isPathable: false},
        12: {isPathable: false},
        13: {isPathable: false},
    },
    source: "src/assets/firecavetilemap.png",
}

export const testCaveTileMap = TileMap.fromObject(testCaveTileMapObject)