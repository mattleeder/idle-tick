import { clamp } from "./camera"
import type { CombatEngine } from "./combat_engine"
import type { TransformComponent } from "./ecs_components"
import { WorldPosition } from "./position"
import type { TileMap } from "./tile_maps"
import { getWestEdgeTiles, getEastEdgeTiles, getNorthEdgeTiles, getSouthEdgeTiles } from "./utilities"

const ONE_TILE_WEST = new WorldPosition(-1, 0)
const ONE_TILE_EAST = new WorldPosition(1, 0)
const ONE_TILE_SOUTH = new WorldPosition(0, 1)
const ONE_TILE_NORTH = new WorldPosition(0, -1)

const ONE_TILE_SOUTH_WEST = new WorldPosition(-1, 1)
const ONE_TILE_SOUTH_EAST = new WorldPosition(1, 1)
const ONE_TILE_NORTH_wEST = new WorldPosition(-1, -1)
const ONE_TILE_NORTH_EAST = new WorldPosition(1, -1)

const DIRECTIONS = {
    "west": ONE_TILE_WEST,
    "east":  ONE_TILE_EAST,
    "south":  ONE_TILE_SOUTH,
    "north":  ONE_TILE_NORTH,

    "southWest": ONE_TILE_SOUTH_WEST,
    "southEast": ONE_TILE_SOUTH_EAST,
    "northWest": ONE_TILE_NORTH_wEST,
    "northEast": ONE_TILE_NORTH_EAST
}

type Direction = keyof typeof DIRECTIONS

const DIAGONAL_CONSTITUENTS: Record<Direction, Direction[]> = {
    "west": [],
    "east": [],
    "south": [],
    "north": [],

    "southWest": ["south", "west"],
    "southEast": ["south", "east"],
    "northWest": ["north", "west"],
    "northEast": ["north", "east"],
}

export function pathingBFS(startTile: WorldPosition, endTile: WorldPosition, engine: CombatEngine): WorldPosition[] {
    // @TODO: this is very slow, should change
    // @TODO: make sure endTile isPathable
    const startTime = performance.now()

    const tileMap = engine.currentTileMap
    
    if (startTile.x == endTile.x && startTile.y == endTile.y) {
        console.log(`pathingBFS: Elapsed Time: ${performance.now() - startTime}ms`)
        return []
    }

    const queue: WorldPosition[] = [startTile]

    const visited = new Map<number, WorldPosition>()
    const directionKeys: Direction[] = [
        "west",
        "east",
        "south",
        "north",

        "southWest",
        "southEast",
        "northWest",
        "northEast",
    ]

    while (queue.length > 0) {
        const currentTile = queue.shift() as WorldPosition

        const directionIsPathableCache: Record<Direction, boolean> = {
            "west": true,
            "east": true,
            "south": true,
            "north": true,
            "southWest": false,
            "southEast": false,
            "northWest": false,
            "northEast": false
        }

        directionLoop: for (const key of directionKeys) {
            const delta = DIRECTIONS[key as Direction]
            const tileToCheck: WorldPosition = currentTile.add(delta)

            const hash = hashWorldPosition(tileToCheck, tileMap)
            if (visited.has(hash)) {
                continue
            }

            visited.set(hash, currentTile)

            const tile = tileMap.getTile(tileToCheck.x, tileToCheck.y)
            if (!tileMap.canPath(tile)) {
                directionIsPathableCache[key as Direction] = false
                continue
            }

            // If diagonal check corners
            const constituentKeys = DIAGONAL_CONSTITUENTS[key as Direction]
            for (const constituent of constituentKeys) {
                if (!directionIsPathableCache[constituent as Direction]) {
                    // @TODO: check this
                    // We cant get to the diagonal now so remove it from visited
                    visited.delete(hash)
                    continue directionLoop
                }
            }

            if (tileToCheck.x == endTile.x && tileToCheck.y == endTile.y) {
                console.log(`pathingBFS: Elapsed Time: ${performance.now() - startTime}ms`)
                const path: WorldPosition[] = []
                let currentPath = tileToCheck
                while (!currentPath.equals(startTile)) {
                    path.push(currentPath)
                    const pathHash = hashWorldPosition(currentPath, tileMap)
                    currentPath = visited.get(pathHash) as WorldPosition
                }
                return path.reverse()
            }

            queue.push(tileToCheck)
        }
    }

    console.log(`pathingBFS: Elapsed Time: ${performance.now() - startTime}ms`)
    return []
}

export function getNpcPathToPlayer(npcTransformComponent: TransformComponent, playerTransformComponent: TransformComponent, engine: CombatEngine): WorldPosition[] {
    // If adjacent to player dont move
    // Else try to move east/west
    // If adjacent to player dont move
    // Else try to move north/south

    // const tileMap = engine.currentTileMap

    const playerPosition = playerTransformComponent.actualNorthWestPosition
    const npcPosition = npcTransformComponent.actualNorthWestPosition
   
    let dx = playerPosition.x - npcPosition.x
    let dy = playerPosition.y - npcPosition.y

    dx = clamp(dx, -1, 1)
    dy = clamp(dy, -1, 1)

    let moveTile = npcTransformComponent.actualNorthWestPosition.copy()

    // Try move east/west
    if (dx != 0) {
        const horizontalTiles = dx == -1 ? getWestEdgeTiles(npcTransformComponent) : getEastEdgeTiles(npcTransformComponent)
        let canMoveEastWest = true

        for (const npcEdgeTile of horizontalTiles) {
            // Is npc adjacent to player?
            if (npcEdgeTile.x + dx == playerPosition.x && npcEdgeTile.y == playerPosition.y) {
                return [moveTile]
            }

            if (!engine.canPath(new WorldPosition(npcEdgeTile.x +dx, npcEdgeTile.y))) {
                canMoveEastWest = false
                break
            }
            // const pathTile = tileMap.getTile(npcEdgeTile.x + dx, npcEdgeTile.y)
            // if (!tileMap.canPath(pathTile)) {
            //     canMoveEastWest = false
            //     break
            // }
        }

        if (canMoveEastWest) {
            moveTile = moveTile.add(new WorldPosition(dx, 0))
        }
    }

    const tempTransformComponent = {
        ...npcTransformComponent
    }
    tempTransformComponent.actualNorthWestPosition = moveTile

    // Try move east/west
    if (dy != 0) {
        const verticalTiles = dy == -1 ? getNorthEdgeTiles(tempTransformComponent) : getSouthEdgeTiles(tempTransformComponent)
        let canMoveNorthSouth = true

        for (const npcEdgeTile of verticalTiles) {
            // Is npc adjacent to player?
            if (npcEdgeTile.x == playerPosition.x && npcEdgeTile.y + dy == playerPosition.y) {
                return [moveTile]
            }

            if (!engine.canPath(new WorldPosition(npcEdgeTile.x, npcEdgeTile.y + dy))) {
                canMoveNorthSouth = false
                break
            }
            // const pathTile = tileMap.getTile(npcEdgeTile.x, npcEdgeTile.y + dy)
            // if (!tileMap.canPath(pathTile)) {
            //     canMoveNorthSouth = false
            //     break
            // }
        }

        if (canMoveNorthSouth) {
            moveTile = moveTile.add(new WorldPosition(0, dy))
        }
    }

    return [moveTile]
}

function hashWorldPosition(worldPosition: WorldPosition, tileMap: TileMap): number {
    return worldPosition.y * tileMap.cols + worldPosition.x
}
