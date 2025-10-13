import { DamageCalculator, DamageSubTypes } from "./damage_calculator";
import type { Coordinator } from "./ecs";
import { type ArmourComponent, type DefensiveStatsComponent, type DamageReceiverComponent, type HealthComponent, type HitSplatComponent, type InventoryComponent, type ItemDetailsComponent, type ModelComponent, type MovementComponent, type OffsensiveStatsComponent, type PlayerEquipmentComponent, type PrayerComponent, type StaminaComponent, type TransformComponent, type HomingProjectileComponent, type PathingComponent, type PlayerComponent } from "./ecs_components";
import { ComponentTypes, EquipmentSlots, InventoryUseType, type Entity } from "./ecs_types";
import { getNpcPathToPlayer, pathingBFS } from "./pathing";
import { WorldPosition } from "./position";
import type { TileMap } from "./tile_maps";

const LOS_EPSILON = 0.01 // For floating point inaccuracies, how close can the time to edge be before we call them equal

export interface LosDebugInfo {
    startTile: WorldPosition,
    endTile: WorldPosition,
    positionsChecked: WorldPosition[],
    tilesChecked: WorldPosition[],
    couldSee: boolean,
}

export function calculateLosBetweenTwoTiles(tileOne: WorldPosition, tileTwo: WorldPosition, tileMap: TileMap, debugInfo?: Record<string, unknown>): boolean {
    const tileOneCentre = tileOne.getCentre()
    const tileTwoCentre = tileTwo.getCentre()

    const delta = tileTwoCentre.sub(tileOneCentre)

    const xSign = delta.x < 0 ? -1 : 1
    const ySign = delta.y < 0 ? -1 : 1

    const yRatio = Math.abs(delta.y / delta.x)

    let currentPosition = tileOneCentre.copy()
    let currentTile = tileOne.copy()

    const losDebugInfo: LosDebugInfo = {
        startTile: tileOne,
        endTile: tileTwo,
        positionsChecked: new Array<WorldPosition>(0),
        tilesChecked: new Array<WorldPosition>(0),
        couldSee: true,
    }

    let canSee = true
    
    while (currentTile.x != tileTwo.x || currentTile.y != tileTwo.y) {
        // Find closest edge

        let distanceToHorizintalEdge = 0
        if (delta.x < 0) {
            distanceToHorizintalEdge = currentPosition.x - (Math.ceil(currentPosition.x) - 1)
        } else {
            distanceToHorizintalEdge = (Math.floor(currentPosition.x) + 1) - currentPosition.x
        }

        let distanceToVerticalEdge = 0
        if (delta.y < 0) {
            distanceToVerticalEdge = currentPosition.y - (Math.ceil(currentPosition.y) - 1)
        } else {
            distanceToVerticalEdge = (Math.floor(currentPosition.y) + 1) - currentPosition.y
        }

        const timeToHorizontalEdge = distanceToHorizintalEdge
        const timeToVerticalEdge = distanceToVerticalEdge / yRatio

        let positionDiff = new WorldPosition(0, 0)
        let tileDiff = new WorldPosition(0, 0)

        if (Math.abs(timeToHorizontalEdge - timeToVerticalEdge) < LOS_EPSILON) {
            // @TODO: when LOS passes over a corner we need to check both perpendicular tiles
            // if neither are pathable then dont have los
            const horizontallyAdjacentToCorner = tileMap.getTile(currentTile.x, currentTile.y + (1 * ySign))
            const verticallyAdjacentToCorner = tileMap.getTile(currentTile.x + (1 * xSign), currentTile.y)
            if (!(tileMap.canPath(horizontallyAdjacentToCorner) || tileMap.canPath(verticallyAdjacentToCorner))) {
                canSee = false
                break
            }
            tileDiff = new WorldPosition(1 * xSign, 1 * ySign)
            positionDiff = new WorldPosition(distanceToHorizintalEdge * xSign, distanceToVerticalEdge * ySign)

        } else if (Math.abs(timeToHorizontalEdge) < Math.abs(timeToVerticalEdge)) {
            tileDiff = new WorldPosition(1 * xSign, 0)
            positionDiff = new WorldPosition(distanceToHorizintalEdge * xSign, distanceToHorizintalEdge * yRatio * ySign)
            
        } else if (Math.abs(timeToHorizontalEdge) > Math.abs(timeToVerticalEdge)) {
            tileDiff = new WorldPosition(0, 1 * ySign)
            positionDiff = new WorldPosition(distanceToVerticalEdge * xSign / yRatio, distanceToVerticalEdge * ySign)
        }

        currentTile = currentTile.add(tileDiff)
        currentPosition = currentPosition.add(positionDiff)

        losDebugInfo.positionsChecked.push(new WorldPosition(currentPosition.x, currentPosition.y))
        losDebugInfo.tilesChecked.push(new WorldPosition(currentTile.x, currentTile.y))

        const tile = tileMap.getTile(currentTile.x, currentTile.y)
        if (!tileMap.canPath(tile)) {
            canSee = false
            break
        }
    }

    losDebugInfo.couldSee = canSee
    if (debugInfo !== undefined) {
        debugInfo["losDebug"] = losDebugInfo
    }
    return canSee
}

export function getPlayerEntityId(): Entity {
    return 0
}

export function getNorthWestPosition(transformComponent: TransformComponent): WorldPosition {
    return transformComponent.actualNorthWestPosition
}

export function getNorthEastPosition(transformComponent: TransformComponent): WorldPosition {
    const northWestPosition = getNorthWestPosition(transformComponent)
    const delta = new WorldPosition(transformComponent.widthInTiles - 1, 0)

    return northWestPosition.add(delta)
}

export function getSouthWestPosition(transformComponent: TransformComponent): WorldPosition {
    const northWestPosition = getNorthWestPosition(transformComponent)
    const delta = new WorldPosition(0, transformComponent.heightInTiles - 1)

    return northWestPosition.add(delta)
}

export function getSouthEastPosition(transformComponent: TransformComponent): WorldPosition {
    const northWestPosition = getNorthWestPosition(transformComponent)
    const delta = new WorldPosition(transformComponent.widthInTiles - 1, transformComponent.heightInTiles - 1)

    return northWestPosition.add(delta)
}

export function getAllTiles(transformComponent: TransformComponent): WorldPosition[] {
    const northWestTile = getNorthWestPosition(transformComponent)
    const height = transformComponent.heightInTiles
    const width = transformComponent.widthInTiles
    const tiles: WorldPosition[] = []

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const delta = new WorldPosition(x, y)
            const tile = northWestTile.add(delta)
            tiles.push(tile)
        }
    }

    return tiles
}

export function getWestEdgeTiles(transformComponent: TransformComponent): WorldPosition[] {
    const northWestTile = getNorthWestPosition(transformComponent)
    const height = transformComponent.heightInTiles

    const westEdgeTiles: WorldPosition[] = []
    for(let i = 0; i < height; i++) {
        westEdgeTiles.push(new WorldPosition(northWestTile.x, northWestTile.y + i))
    }

    return westEdgeTiles
}

export function getEastEdgeTiles(transformComponent: TransformComponent): WorldPosition[] {
    const northEastTile = getNorthEastPosition(transformComponent)
    const height = transformComponent.heightInTiles

    const eastEdgeTiles: WorldPosition[] = []
    for(let i = 0; i < height; i++) {
        eastEdgeTiles.push(new WorldPosition(northEastTile.x, northEastTile.y + i))
    }

    return eastEdgeTiles
}

export function getNorthEdgeTiles(transformComponent: TransformComponent): WorldPosition[] {
    const northWestTile = getNorthWestPosition(transformComponent)
    const width = transformComponent.widthInTiles

    const northEdgeTiles: WorldPosition[] = []
    for(let i = 0; i < width; i++) {
        northEdgeTiles.push(new WorldPosition(northWestTile.x + i, northWestTile.y))
    }

    return northEdgeTiles
}

export function getSouthEdgeTiles(transformComponent: TransformComponent): WorldPosition[] {
    const southWestTile = getSouthWestPosition(transformComponent)
    const width = transformComponent.widthInTiles

    const southEdgeTiles: WorldPosition[] = []
    for(let i = 0; i < width; i++) {
        southEdgeTiles.push(new WorldPosition(southWestTile.x + i, southWestTile.y))
    }

    return southEdgeTiles
}

export function getAllEdgeTiles(transformComponent: TransformComponent): WorldPosition[] {
    const northWestTile = getNorthWestPosition(transformComponent)
    const width = transformComponent.widthInTiles
    const height = transformComponent.heightInTiles
    const allEdgeTiles: WorldPosition[] = []

    for (let y = 0; y < height; y++) {
        // If at top or bottom of entity, then add all tiles across its width
        // Otherwise just add the end tiles
        if (y == 0 || y == height - 1) {
            for (let x = 0; x < width; x++) {
                const delta = new WorldPosition(x, y)
                allEdgeTiles.push(northWestTile.add(delta))
            }
        } else if (width == 1) {
            const westDelta = new WorldPosition(0, y)
            allEdgeTiles.push(northWestTile.add(westDelta))
        } else {
            const westDelta = new WorldPosition(0, y)
            const eastDelta = new WorldPosition(width - 1, y)
            allEdgeTiles.push(northWestTile.add(westDelta))
            allEdgeTiles.push(northWestTile.add(eastDelta))
        }
    }

    return allEdgeTiles
}

export function createTestItem(coordinator: Coordinator): Entity {
    const itemEntity = coordinator.createEntity()
    coordinator.addComponent<ItemDetailsComponent>(itemEntity, ComponentTypes.ItemDetails, {
        name: "Test Item",
        description: "Test Description",
        icon: "src/assets/test_item.png",
        itemType: InventoryUseType.Equip,
    })

    coordinator.addComponent<ArmourComponent>(itemEntity, ComponentTypes.Armour, {
        attackLevelRequirement: 0,
        strengthLevelRequirement: 0,
        rangedLevelRequirement: 0,
        magicLevelRequirement: 0,
        defenceLevelRequirement: 0,

        stabAttackBonus: 1,
        slashAttackBonus: 1,
        crushAttackBonus: 1,
        rangedAttackBonus: 1,
        magicAttackBonus: 1,

        stabDefenceBonus: 1,
        slashDefenceBonus: 1,
        crushDefenceBonus: 1,
        rangedDefenceBonus: 1,
        magicDefenceBonus: 1,

        meleeStrengthBonus: 1,
        rangedStrengthBonus: 1,
        magicDamageBonus: 1,
        prayerBonus: 1,

        equipSlots: [EquipmentSlots.Head]

    })
    return itemEntity
}

export function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * max) + min
}

export function checkSuccess(chance: number): boolean {
    return Math.random() < chance
}

export function pathingBFSWrapper(currentPosition: TransformComponent, targetPosition: TransformComponent, tileMap: TileMap): WorldPosition[] {
    return pathingBFS(currentPosition.actualNorthWestPosition, targetPosition.actualNorthWestPosition, tileMap)
}

export function createPlayer(coordinator: Coordinator) {
    const player = coordinator.createEntity()
    
    coordinator.addComponent<PlayerComponent>(player, ComponentTypes.Player, {
        tag: true,
    })
    coordinator.addComponent<TransformComponent>(player, ComponentTypes.Transform, {
        actualNorthWestPosition: new WorldPosition(4, 5),
        renderNorthWestPosition: new WorldPosition(4, 5),
        widthInTiles: 1,
        heightInTiles: 1
    })
    coordinator.addComponent<PathingComponent>(player, ComponentTypes.Pathing, {
        pathingFunction: pathingBFSWrapper
    })
    coordinator.addComponent<ModelComponent>(player, ComponentTypes.Model, {
        currentModel: "src/assets/monster.png",
        animationPlayTimeTicks: 1,
        animationDurationTicks: 1,
        animationShouldLoop: true,
        animationHasEnded: false,
    })
    coordinator.addComponent<MovementComponent>(player, ComponentTypes.Movement, {
        moveSpeed: 2,
        movementPath: [],
        renderTimeInTicks: 0.5,
        movementRenderData: [],
    })
    coordinator.addComponent<StaminaComponent>(player, ComponentTypes.Stamina, {
        isRunning: true,
        currentStaminaPoints: 100,
        maxStaminaPoints: 100,
        staminaRegenRate: 1,
    })
    coordinator.addComponent<HealthComponent>(player, ComponentTypes.Health, {
        currentHealth: 99,
        maxHealth: 99,
    })
    coordinator.addComponent<HitSplatComponent>(player, ComponentTypes.HitSplat, {
        hitSplats: [],
    })
    coordinator.addComponent<DamageReceiverComponent>(player, ComponentTypes.DamageReceiver, {
        damage: [],
    })
    coordinator.addComponent<InventoryComponent>(player, ComponentTypes.Inventory, {
        slots: Array<Entity | null>(28).fill(null),
    })
    coordinator.addComponent<PlayerEquipmentComponent>(player, ComponentTypes.PlayerEquipment, {
        head: null,
        chest: null,
        legs: null,
        mainHand: null,
        offHand: null,
        boots: null,
        gloves: null,
        ring: null,
        neck: null,
        cape: null,
        ammo: null
    })
    coordinator.addComponent<PrayerComponent>(player, ComponentTypes.Prayer, {
        currentPrayerPoints: 99,
        maxPrayerPoints: 99,
        activePrayers: new Set(),
    })
    coordinator.addComponent<OffsensiveStatsComponent>(player, ComponentTypes.OffensiveStats, {
        attackLevel: 99,
        strengthLevel: 99,
        magicLevel: 99,
        rangedLevel: 200,

        stabAttackBonus: 0,
        slashAttackBonus: 0,
        crushAttackBonus: 0,
        rangedAttackBonus: 250,
        magicAttackBonus: 0,

        meleeStrengthBonus: 0,
        rangedStrengthBonus: 20,
        magicDamageBonus: 0,
        prayerBonus: 0,

        attackRange: 10,
        attackCooldown: 5,
        ticksUntilCanAttack: 0,
        createAttack: createStandardRangeAttack,
    })
    coordinator.addComponent<DefensiveStatsComponent>(player, ComponentTypes.DefensiveStats, {
        magicLevel: 99,
        defenceLevel: 99,

        stabDefenceBonus: 59,
        slashDefenceBonus: 52,
        crushDefenceBonus: 64,
        rangedDefenceBonus: 60,
        magicDefenceBonus: 74,
    })

    return player
}

export function getRenderCentreOfTransform(transformComponent: TransformComponent) {
    const halfWidth = transformComponent.widthInTiles / 2
    const halfHeight = transformComponent.heightInTiles / 2

    return transformComponent.renderNorthWestPosition.add(new WorldPosition(halfWidth, halfHeight))
}

export function getActualCentreOfTransform(transformComponent: TransformComponent) {
    const halfWidth = transformComponent.widthInTiles / 2
    const halfHeight = transformComponent.heightInTiles / 2

    return transformComponent.actualNorthWestPosition.add(new WorldPosition(halfWidth, halfHeight))
}

export function npcWasClicked(npcTransformComponent: TransformComponent, clickWorldPosition: WorldPosition): boolean {
    const northWestCorner = npcTransformComponent.renderNorthWestPosition
    const southEastCorner = npcTransformComponent.renderNorthWestPosition.add(new WorldPosition(npcTransformComponent.widthInTiles, npcTransformComponent.heightInTiles))

    if (clickWorldPosition.x < northWestCorner.x || clickWorldPosition.x > southEastCorner.x) {
        return false
    }

    if (clickWorldPosition.y < northWestCorner.y || clickWorldPosition.y > southEastCorner.y) {
        return false
    }

    return true
}

export function getPlayerAttackRollType(coordinator: Coordinator, playerEntity: Entity) {
    return DamageSubTypes.Ranged
}

export function getPlayerDefenceRollType(coordinator: Coordinator, playerEntity: Entity) {
    return DamageSubTypes.Ranged
}

export function playerAttackTarget(coordinator: Coordinator, playerEntity: Entity, targetEntity: Entity) {
    const playerOffensiveStatsComponent = coordinator.getComponent<OffsensiveStatsComponent>(playerEntity, ComponentTypes.OffensiveStats)
    const targetDefensiveStatsComponent = coordinator.getComponent<DefensiveStatsComponent>(targetEntity, ComponentTypes.DefensiveStats)

    const playerAttackRollType = getPlayerAttackRollType(coordinator, playerEntity)
    const playerDefenceRollType = getPlayerDefenceRollType(coordinator, playerEntity)

    const damage = DamageCalculator.calculateDamage(playerOffensiveStatsComponent, targetDefensiveStatsComponent, playerAttackRollType, playerDefenceRollType)
    console.log(`Player did ${damage} damage`)
    createTestProjectile(coordinator, playerEntity, targetEntity, damage)

    playerOffensiveStatsComponent.ticksUntilCanAttack += playerOffensiveStatsComponent.attackCooldown
}

export function createTestProjectile(coordinator: Coordinator, source: Entity, target: Entity, damage: number) {
    const sourceTransformComponent = coordinator.getComponent<TransformComponent>(source ,ComponentTypes.Transform)

    const projectile = coordinator.createEntity()

    coordinator.addComponent<ModelComponent>(projectile, ComponentTypes.Model, {
        currentModel: "src/assets/ranged_projectile_animation_frame_one.png",
        animationPlayTimeTicks: 0,
        animationDurationTicks: 0.5,
        animationShouldLoop: true,
        animationHasEnded: false,
    })

    const projectileWidth = 0.2
    const projectileHeight = 0.2

    coordinator.addComponent<TransformComponent>(projectile, ComponentTypes.Transform, {
        actualNorthWestPosition: sourceTransformComponent.actualNorthWestPosition,
        renderNorthWestPosition: sourceTransformComponent.renderNorthWestPosition.add(new WorldPosition((sourceTransformComponent.widthInTiles - projectileWidth) / 2, (sourceTransformComponent.heightInTiles - projectileHeight) / 2)),
        widthInTiles: projectileWidth,
        heightInTiles: projectileHeight,
    })

    coordinator.addComponent<HomingProjectileComponent>(projectile, ComponentTypes.HomingProjectile, {
        target: target,
        source: source,
        ticksUntilImpact: 3,
        damage: damage,
        nullified: false,
    })

    return projectile
}

export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function addStandardMonsterMovementComponentToEntity(coordinator: Coordinator, entity: Entity) {
    coordinator.addComponent<MovementComponent>(entity, ComponentTypes.Movement, {
        moveSpeed: 1,
        movementPath: [],
        renderTimeInTicks: 0.5,
        movementRenderData: [],
    })

    coordinator.addComponent<PathingComponent>(entity, ComponentTypes.Pathing, {
        pathingFunction: getNpcPathToPlayer
    })
}

export function createStandardRangeAttack(coordinator: Coordinator, source: Entity, target: Entity) {
    const sourceOffensiveStatsComponent = coordinator.getComponent<OffsensiveStatsComponent>(source, ComponentTypes.OffensiveStats)
    const targetDefensiveStatsComponent = coordinator.getComponent<DefensiveStatsComponent>(target, ComponentTypes.DefensiveStats)

    const sourcePrayerComponent = coordinator.getComponentWithDefault<PrayerComponent>(source, {currentPrayerPoints: 0, maxPrayerPoints: 0, activePrayers: new Set()}, ComponentTypes.Prayer)
    const targetPrayerComponent = coordinator.getComponentWithDefault<PrayerComponent>(target, {currentPrayerPoints: 0, maxPrayerPoints: 0, activePrayers: new Set()}, ComponentTypes.Prayer)

    const damage = DamageCalculator.calculateDamage(sourceOffensiveStatsComponent, targetDefensiveStatsComponent, DamageSubTypes.Ranged, DamageSubTypes.Ranged, sourcePrayerComponent, targetPrayerComponent)
    createTestProjectile(coordinator, source, target, damage)
}

// @TODO: need to calculate distance based on closest tile