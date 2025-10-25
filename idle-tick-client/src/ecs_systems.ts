import { BitSet } from "./bitSet"
import { clamp } from "./camera"
import type { ConsumeFunction } from "./combat_input_queue"
import { Coordinator, System } from "./ecs"
import type { TransformComponent, MovementComponent, StaminaComponent, ModelComponent, HealthComponent, DamageReceiverComponent, HitSplatComponent, OffsensiveStatsComponent, HomingProjectileComponent, InventoryComponent, ItemDetailsComponent, PlayerEquipmentComponent, PrayerComponent, AttackCommandComponent, PathingComponent, DefensiveStatsComponent } from "./ecs_components"
import { type Entity, type Signature, SystemTypes, ComponentTypes, type EquipmentSlotKeys, type PrayerKeys } from "./ecs_types"
import { addEquipmentStatsToDefensiveStats, addEquipmentStatsToOffensiveStats, getEquipmentInformation, subtractEquipmentStatsFromDefensiveStats, subtractEquipmentStatsFromOffensiveStats } from "./equipment_map"
import { INVENTORY_SIZE, MAX_SYSTEMS, TICK_RATE_MS } from "./globals"
import { WorldPosition } from "./position"
import { calculateLosBetweenTwoTiles, getAllEdgeTiles, getAllTiles, getPlayerEntityId } from "./utilities"

// Movement System
// What does it do
//  - On tick, adds movement vector onto entities current actual position then schedules render position update
//  - On update, updates the entities render position along a movement vector over a period of time
// What does it need to know
//  - Where is the entities current actual position                 (transform)
//  - Where is the entities current render position                 (transform)
//  - What is the movement vector                                   (movement)
//  - How long should it take for the render position to update     (movement)
export class MovementSystem extends System {
    initialise(): void {
        this.coordinator.registerSystem<MovementSystem>(SystemTypes.Movement, this)
        
        const componentTypes = [
            ComponentTypes.Transform,
            ComponentTypes.Movement,
        ]

        const signature: Signature = new BitSet(MAX_SYSTEMS)
        for (const componentType of componentTypes) {
            signature.set(this.coordinator.getComponentType(componentType))
        }
        this.coordinator.setSystemSignature(signature, SystemTypes.Movement)
    }

    update(deltaTimeMs: number): void {
        for (const entity of this.entities) {
            const transformComponent = this.coordinator.getComponent<TransformComponent>(entity, ComponentTypes.Transform)
            const movementComponent = this.coordinator.getComponent<MovementComponent>(entity, ComponentTypes.Movement)

            if (movementComponent.movementRenderData.length == 0) {
                continue
            }

            const movementRenderData = movementComponent.movementRenderData[0]

            if (movementRenderData.renderTimeInTicks <= 0) {
                continue
            }

            const numTicksThatHavePassed = deltaTimeMs / TICK_RATE_MS
            const ratioToMoveAlongDelta = Math.min(numTicksThatHavePassed / movementRenderData.renderTimeInTicks, 1)
            const renderPositionDelta = movementRenderData.targetPosition.sub(transformComponent.renderNorthWestPosition).mul(ratioToMoveAlongDelta)

            transformComponent.renderNorthWestPosition = transformComponent.renderNorthWestPosition.add(renderPositionDelta)

            movementRenderData.renderTimeInTicks = Math.max(0, movementRenderData.renderTimeInTicks - numTicksThatHavePassed)
        }
    }

    tick(): void {
        for (const entity of this.entities) {
            const transformComponent = this.coordinator.getComponent<TransformComponent>(entity, ComponentTypes.Transform)
            const movementComponent = this.coordinator.getComponent<MovementComponent>(entity, ComponentTypes.Movement)

            this.processMovement(transformComponent, movementComponent)

        }
    }

    processMovement(transformComponent: TransformComponent, movementComponent: MovementComponent) {
        const oldTiles = getAllTiles(transformComponent)
        this.coordinator.getEngine().unblockTiles(oldTiles)
        for (let i = 0; i < movementComponent.currentMoveSpeed; i++) {
            transformComponent.actualNorthWestPosition = movementComponent.movementPath.shift() || transformComponent.actualNorthWestPosition
        }
        const newTiles = getAllTiles(transformComponent)
        this.coordinator.getEngine().blockTiles(newTiles)

        clamp(movementComponent.renderTimeInTicks, 0, 1)

        movementComponent.movementRenderData.shift()

        movementComponent.movementRenderData.push({
            targetPosition: transformComponent.actualNorthWestPosition,
            renderTimeInTicks: movementComponent.renderTimeInTicks,
        })
    }

    moveOnTick(entity: Entity, movementPath: WorldPosition[]) {
        const movementComponent = this.coordinator.getComponent<MovementComponent>(entity, ComponentTypes.Movement)
        movementComponent.movementPath = movementPath
    }

    moveNow(coordinator: Coordinator, entity: Entity, movementPath: WorldPosition[]) {
        const transformComponent = coordinator.getComponent<TransformComponent>(entity, ComponentTypes.Transform)
        const movementComponent = coordinator.getComponent<MovementComponent>(entity, ComponentTypes.Movement)
        movementComponent.movementPath = movementPath

        this.processMovement(transformComponent, movementComponent)

        // @TODO: should we clear movement?
        // movementComponent.movementPath = []
    }

}

// Stamina System
// What does it do
//  - Regens stamina if not running
//  - Drains stamins if running
//  - Turns off run if stamina is 0
// What does it need to know
//  - Current Stamina       (stamina)
//  - Max Stamina           (stamina)
//  - Stamina regen rate    (stamina)
//  - Is running            (movement)
export class StaminaSystem extends System {
    initialise(): void {
        this.coordinator.registerSystem<StaminaSystem>(SystemTypes.Stamina, this)

        const componentTypes = [
            ComponentTypes.Stamina,
            ComponentTypes.Movement,
        ]
        
        const signature: Signature = new BitSet(MAX_SYSTEMS)
        for (const componentType of componentTypes) {
            signature.set(this.coordinator.getComponentType(componentType))
        }
        this.coordinator.setSystemSignature(signature, SystemTypes.Stamina)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(_deltaTimeMs: number): void {
        // Stamina does nothing per frame
    }

    tick(): void {
        for (const entity of this.entities) {
            const staminaComponent = this.coordinator.getComponent<StaminaComponent>(entity, ComponentTypes.Stamina)
            const movementComponent = this.coordinator.getComponent<MovementComponent>(entity, ComponentTypes.Movement)

            if (staminaComponent.isRunning && movementComponent.movementPath.length > 0) {
                staminaComponent.currentStaminaPoints = Math.max(0, staminaComponent.currentStaminaPoints - 1)
                if (staminaComponent.currentStaminaPoints <= 0) {
                    StaminaSystem.turnOffRun(staminaComponent, movementComponent)
                }
            } else {
                staminaComponent.currentStaminaPoints = Math.min(staminaComponent.maxStaminaPoints, staminaComponent.currentStaminaPoints + staminaComponent.staminaRegenRate)
            }

        }
    }

    static turnOffRun(staminaComponent: StaminaComponent, movementComponent: MovementComponent) {
        staminaComponent.isRunning = false
        movementComponent.currentMoveSpeed = movementComponent.baseMoveSpeed 
    }

    static turnOnRun(staminaComponent: StaminaComponent, movementComponent: MovementComponent) {
        staminaComponent.isRunning = true
        movementComponent.currentMoveSpeed = 2 * movementComponent.baseMoveSpeed 
    }
}

// Animation System
// What does it do
//  - Checks the time that has passed and updates the model if enough time has passed
// What does it need to know
//  - How long an animation has played for  (model)
export class AnimationSystem extends System {
    initialise(): void {
        this.coordinator.registerSystem<AnimationSystem>(SystemTypes.Animation, this)

        const componentTypes = [
            ComponentTypes.Model,
        ]
        
        const signature: Signature = new BitSet(MAX_SYSTEMS)
        for (const componentType of componentTypes) {
            signature.set(this.coordinator.getComponentType(componentType))
        }
        this.coordinator.setSystemSignature(signature, SystemTypes.Animation)
    }

    update(deltaTimeMs: number): void {
        for (const entity of this.entities) {
            const modelComponent = this.coordinator.getComponent<ModelComponent>(entity, ComponentTypes.Model)
            const numberOfTicksPassed = deltaTimeMs / TICK_RATE_MS

            modelComponent.animationPlayTimeTicks += numberOfTicksPassed

            if (modelComponent.animationShouldLoop) {
                modelComponent.animationPlayTimeTicks %= modelComponent.animationDurationTicks
            } else if (modelComponent.animationPlayTimeTicks >= modelComponent.animationDurationTicks) {
                modelComponent.animationHasEnded = true
            }
        }
    }

    tick(): void {
        
    }
}

// DamageReceiver System
// What does it do?
// - Allows entities to receive damage
// - Creates hitsplats for damage received
// - Checks if entities have died
// - Decrements ticks left on hitsplats by 1
// - Removes expired hitsplats
// What does it need to know?
// - Health             (health)
// - Incoming damage    (damage receiver)
// - Damage source      (damage receiver)
// - Hitsplats          (hitsplats)
export class DamageReceiverSystem extends System {
    initialise(): void {
        this.coordinator.registerSystem<DamageReceiverSystem>(SystemTypes.DamageReceiver, this)

        const componentTypes = [
            ComponentTypes.Health,
            ComponentTypes.DamageReceiver,
            ComponentTypes.HitSplat,
        ]

        const signature: Signature = new BitSet(MAX_SYSTEMS)
        for (const componentType of componentTypes) {
            signature.set(this.coordinator.getComponentType(componentType))
        }
        this.coordinator.setSystemSignature(signature, SystemTypes.DamageReceiver)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(_deltaTimeMs: number): void {
        return
    }

    tick(): void {
        for (const entity of this.entities) {
            const healthComponent = this.coordinator.getComponent<HealthComponent>(entity, ComponentTypes.Health)
            const damageComponent = this.coordinator.getComponent<DamageReceiverComponent>(entity, ComponentTypes.DamageReceiver)
            const hitSplatComponent = this.coordinator.getComponent<HitSplatComponent>(entity, ComponentTypes.HitSplat)

            // Decrement and remove hitsplats
            for (let i = hitSplatComponent.hitSplats.length - 1; i >= 0; i--) {
                hitSplatComponent.hitSplats[i].ticksLeft -= 1
                if (hitSplatComponent.hitSplats[i].ticksLeft <= 0) {
                    hitSplatComponent.hitSplats.splice(i, 1)
                }
            }

            // Calculate new health and create new hitsplats
            for (const damageItem of damageComponent.damage) {
                healthComponent.currentHealth = Math.max(0, healthComponent.currentHealth - damageItem.damageAmount)
                hitSplatComponent.hitSplats.push({
                    damage: damageItem.damageAmount,
                    hitSplatType: "default",
                    ticksLeft: 2,
                })
                if (healthComponent.currentHealth <= 0) {
                    console.log(`Entity: ${entity} has died`)
                }
            }

            damageComponent.damage = []
        }
    }
}

// SimpleBehaviour System
// What does it do
// - Makes monsters aggressive to the player
// What does it need
// -
export class SimpleBehaviourSystem extends System {
    initialise(): void {
        this.coordinator.registerSystem<SimpleBehaviourSystem>(SystemTypes.SimpleBehaviour, this)

        const componentTypes = [
            // ComponentTypes.OffensiveStats,
            ComponentTypes.SimpleBehaviour,
        ]

        const signature: Signature = new BitSet(MAX_SYSTEMS)
        for (const componentType of componentTypes) {
            signature.set(this.coordinator.getComponentType(componentType))
        }
        this.coordinator.setSystemSignature(signature, SystemTypes.SimpleBehaviour)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(_deltaTimeMs: number): void {
        return 
    }

    tick(): void {
        for (const entity of this.entities) {
            const playerEntityID = getPlayerEntityId()
            // Wander
            // If in range add attack command component
            // Could add some kind of state to the behaviour componenet

            this.coordinator.addComponent<AttackCommandComponent>(entity, ComponentTypes.AttackCommand, {target: playerEntityID})
            this.coordinator.removeComponent(entity, ComponentTypes.SimpleBehaviour)
        }
    }

}

export class HomingProjectileSystem extends System {
    private distanceAtTickStart: Map<Entity, WorldPosition> = new Map()

    initialise(): void {
        const systemTypeKey = SystemTypes.HomingProjectile
        
        const componentTypes = [
            ComponentTypes.Transform,
            ComponentTypes.HomingProjectile,
        ]
        
        this.coordinator.registerSystem<HomingProjectileSystem>(systemTypeKey, this)

        const signature: Signature = new BitSet(MAX_SYSTEMS)
        for (const componentType of componentTypes) {
            signature.set(this.coordinator.getComponentType(componentType))
        }
        this.coordinator.setSystemSignature(signature, systemTypeKey)
    }

    update(deltaTimeMs: number): void {
        // @TODO: fix this
        for (const entity of this.entities) {
            const homingProjectileComponent = this.coordinator.getComponent<HomingProjectileComponent>(entity, ComponentTypes.HomingProjectile)
            const target = homingProjectileComponent.target

            if (homingProjectileComponent.ticksUntilImpact <= 0) {
                continue
            }

            const homingProjectileTransformComponent = this.coordinator.getComponent<TransformComponent>(entity, ComponentTypes.Transform)
            const homingProjectileCentre = homingProjectileTransformComponent.renderNorthWestPosition.add(new WorldPosition(homingProjectileTransformComponent.widthInTiles / 2, homingProjectileTransformComponent.heightInTiles / 2))

            const targetTransformComponent = this.coordinator.getComponent<TransformComponent>(target, ComponentTypes.Transform)
            const targetCentre = targetTransformComponent.renderNorthWestPosition.add(new WorldPosition(targetTransformComponent.widthInTiles / 2, targetTransformComponent.heightInTiles / 2))

            // @TODO: cache this?
            let delta = targetCentre.sub(homingProjectileCentre)
            const timeUntilImpact = TICK_RATE_MS * Math.max(homingProjectileComponent.ticksUntilImpact - 1, 1)
            const ratio = deltaTimeMs / timeUntilImpact
            delta = delta.mul(ratio)
            homingProjectileTransformComponent.renderNorthWestPosition = homingProjectileTransformComponent.renderNorthWestPosition.add(delta)
        }
    }

    tick(): void {
        this.distanceAtTickStart.clear()
        const toDestroy: Entity[] = []

        for (const entity of this.entities) {
            const homingProjectileComponent = this.coordinator.getComponent<HomingProjectileComponent>(entity, ComponentTypes.HomingProjectile)
            const homingProjectileTransformComponent = this.coordinator.getComponent<TransformComponent>(entity, ComponentTypes.Transform)
            const target = homingProjectileComponent.target
            const targetTransformComponent = this.coordinator.getComponent<TransformComponent>(target, ComponentTypes.Transform)

            let delta = targetTransformComponent.actualNorthWestPosition.sub(homingProjectileTransformComponent.actualNorthWestPosition)
            delta = delta.mul(1 / homingProjectileComponent.ticksUntilImpact)
            homingProjectileTransformComponent.actualNorthWestPosition = homingProjectileTransformComponent.actualNorthWestPosition.add(delta)

            homingProjectileComponent.ticksUntilImpact -= 1
            if (homingProjectileComponent.ticksUntilImpact == 0) {
                const targetDamageReceiver = this.coordinator.getComponent<DamageReceiverComponent>(target, ComponentTypes.DamageReceiver)
                targetDamageReceiver.damage.push({
                    source: homingProjectileComponent.source,
                    damageAmount: homingProjectileComponent.damage,
                })

                toDestroy.push(entity)

                // @TODO: can this be done in the loop?
                // this.coordinator.destroyEntity(entity)
            }
        }

        while (toDestroy.length > 0) {
            this.coordinator.destroyEntity(toDestroy.shift() as number)
        }
    }
}

export class InventorySystem extends System {
    initialise(): void {
        const systemTypeKey = SystemTypes.Inventory
        
        const componentTypes = [
            ComponentTypes.Inventory,
        ]
        
        this.coordinator.registerSystem<InventorySystem>(systemTypeKey, this)

        const signature: Signature = new BitSet(MAX_SYSTEMS)
        for (const componentType of componentTypes) {
            signature.set(this.coordinator.getComponentType(componentType))
        }
        this.coordinator.setSystemSignature(signature, systemTypeKey)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(_deltaTimeMs: number): void {
        
    }

    tick(): void {
        
    }

    pickupItem(inventoryEntity: Entity, itemEntity: Entity) {
        const inventoryComponent = this.coordinator.getComponent<InventoryComponent>(inventoryEntity, ComponentTypes.Inventory)
        inventoryComponent.slots.push(itemEntity)

        this.coordinator.removeComponent(itemEntity, ComponentTypes.Transform)
    }

    dropItem(inventoryEntity: Entity, itemEntity: Entity) {
        const inventoryComponent = this.coordinator.getComponent<InventoryComponent>(inventoryEntity, ComponentTypes.Inventory)
        const transformComponent = this.coordinator.getComponent<TransformComponent>(inventoryEntity, ComponentTypes.Transform)
        
        this.coordinator.addComponent<TransformComponent>(itemEntity, ComponentTypes.Transform, {
            actualNorthWestPosition: transformComponent.actualNorthWestPosition.copy(),
            renderNorthWestPosition: transformComponent.renderNorthWestPosition.copy(),
            widthInTiles: 1,
            heightInTiles: 1,
        })

        const itemIndex = inventoryComponent.slots.findIndex((value) => value == itemEntity)
        if (itemIndex == -1) {
            throw new Error("Could not find item index")
        }
        
        inventoryComponent.slots[itemIndex] = null
    }

    consumeItem(inventoryEntity: Entity, itemEntity: Entity, inventoryPosition: number, consumeFunction: ConsumeFunction) {
        const inventoryComponent = this.coordinator.getComponent<InventoryComponent>(inventoryEntity, ComponentTypes.Inventory)

        if (inventoryComponent.slots[inventoryPosition] != itemEntity) {
            console.warn(`item: ${itemEntity} has been moved from inventory slot ${inventoryPosition}`)
            return
        }

        consumeFunction(this.coordinator, inventoryEntity)
        console.log("Consumed")
    }
}

export class PlayerEquipmentSystem extends System {
    initialise(): void {
        const systemTypeKey = SystemTypes.PlayerEquipment

        const componentTypes = [
            ComponentTypes.Inventory,
            ComponentTypes.PlayerEquipment,
        ]

        this.coordinator.registerSystem<PlayerEquipmentSystem>(systemTypeKey, this)

        const signature: Signature = new BitSet(MAX_SYSTEMS)
        for (const componentType of componentTypes) {
            signature.set(this.coordinator.getComponentType(componentType))
        }
        this.coordinator.setSystemSignature(signature, systemTypeKey)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(_deltaTimeMs: number): void {
        
    }

    tick(): void {
        
    }

    tryToEquip(playerEntity: Entity, itemEntity: Entity) {
        // Item must be equippable
        // Item must be in inventory
        // Inventory must have space

        const itemDetailsComponent = this.coordinator.getComponent<ItemDetailsComponent>(itemEntity, ComponentTypes.ItemDetails)
        const playerInventoryComponent = this.coordinator.getComponent<InventoryComponent>(playerEntity, ComponentTypes.Inventory)
        const playerEquipmentComponent = this.coordinator.getComponent<PlayerEquipmentComponent>(playerEntity, ComponentTypes.PlayerEquipment)
        const playerOffensiveStatsComponent = this.coordinator.getComponent<OffsensiveStatsComponent>(playerEntity, ComponentTypes.OffensiveStats)
        const playerDefensiveStatsComponent = this.coordinator.getComponent<DefensiveStatsComponent>(playerEntity, ComponentTypes.DefensiveStats)

        let itemIndex = -1
        let inventorySpaces = 0
        for (let i = 0; i < INVENTORY_SIZE; i++) {
            const entityID = playerInventoryComponent.slots[i]

            if (entityID == null) {
                inventorySpaces += 1
            } else if (entityID == itemEntity) {
                itemIndex = i
            }
        }

        const equipmentInformation = getEquipmentInformation(itemDetailsComponent.itemKey)

        if (itemIndex == -1) {
            console.error(`itemEntity: ${itemEntity} not in player inventory`)
            return
        }

        if (inventorySpaces < equipmentInformation.equipmentStats.equipSlots.length) {
            throw new Error(`only have ${inventorySpaces} spaces in inventory, cannot equip`)
        }

        for (const equipSlot of equipmentInformation.equipmentStats.equipSlots) {
            // @TODO: make unequip
            // Unequip
            this.tryToUnEquip(playerEntity, equipSlot)
        }

        // Use first slot
        const equipSlotKey = equipmentInformation.equipmentStats.equipSlots[0]
        playerEquipmentComponent[equipSlotKey] = itemEntity
        playerInventoryComponent.slots[itemIndex] = null

        addEquipmentStatsToOffensiveStats(itemDetailsComponent.itemKey, playerOffensiveStatsComponent)
        addEquipmentStatsToDefensiveStats(itemDetailsComponent.itemKey, playerDefensiveStatsComponent)
    }

    tryToUnEquip(playerEntity: Entity, slot: EquipmentSlotKeys) {

        const playerInventoryComponent = this.coordinator.getComponent<InventoryComponent>(playerEntity, ComponentTypes.Inventory)
        const playerEquipmentComponent = this.coordinator.getComponent<PlayerEquipmentComponent>(playerEntity, ComponentTypes.PlayerEquipment)
        const playerOffensiveStatsComponent = this.coordinator.getComponent<OffsensiveStatsComponent>(playerEntity, ComponentTypes.OffensiveStats)
        const playerDefensiveStatsComponent = this.coordinator.getComponent<DefensiveStatsComponent>(playerEntity, ComponentTypes.DefensiveStats)

        const itemEntity = playerEquipmentComponent[slot]
        
        if (itemEntity === null) {
            console.error(`cannot unequip :${slot} as its empty`)
            return
        }

        const itemDetailsComponent = this.coordinator.getComponent<ItemDetailsComponent>(itemEntity, ComponentTypes.ItemDetails)

        const inventorySpace = playerInventoryComponent.slots.findIndex((value) => value == null)

        if (inventorySpace == -1) {
            throw new Error(`no free inventory space`)
        }

        playerInventoryComponent.slots[inventorySpace] = playerEquipmentComponent[slot]
        playerEquipmentComponent[slot] = null

        subtractEquipmentStatsFromOffensiveStats(itemDetailsComponent.itemKey, playerOffensiveStatsComponent)
        subtractEquipmentStatsFromDefensiveStats(itemDetailsComponent.itemKey, playerDefensiveStatsComponent)
    }
}

export class PrayerSystem extends System {
    initialise(): void {
        const systemTypeKey = SystemTypes.Prayer

        const componentTypes = [
            ComponentTypes.Prayer
        ]

        this.coordinator.registerSystem<PrayerSystem>(systemTypeKey, this)

        const signature: Signature = new BitSet(MAX_SYSTEMS)
        for (const componentType of componentTypes) {
            signature.set(this.coordinator.getComponentType(componentType))
        }
        this.coordinator.setSystemSignature(signature, systemTypeKey)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(_deltaTimeMs: number): void {
        
    }

    tick(): void {
        // Drain prayer
    }

    changePrayer(entity: Entity, prayer: PrayerKeys) {
        // Should check if prayer is available to use
        const prayerComponent = this.coordinator.getComponent<PrayerComponent>(entity, ComponentTypes.Prayer)
        if (prayerComponent.activePrayers.has(prayer)) {
            prayerComponent.activePrayers.delete(prayer)
        } else {
            prayerComponent.activePrayers.clear()
            prayerComponent.activePrayers.add(prayer)
        }
    }
}

export class AttackCooldownSystem extends System {
    initialise(): void {
        const systemTypeKey = SystemTypes.AttackCooldown

        const componentTypes = [
            ComponentTypes.OffensiveStats
        ]

        this.coordinator.registerSystem<AttackCooldownSystem>(systemTypeKey, this)

        const signature: Signature = new BitSet(MAX_SYSTEMS)
        for (const componentType of componentTypes) {
            signature.set(this.coordinator.getComponentType(componentType))
        }
        this.coordinator.setSystemSignature(signature, systemTypeKey)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(_deltaTimeMs: number): void {
        
    }

    tick(): void {
        for (const entity of this.entities) {
            const offensiveStatsComponent = this.coordinator.getComponent<OffsensiveStatsComponent>(entity, ComponentTypes.OffensiveStats)
            offensiveStatsComponent.ticksUntilCanAttack = Math.max(0, offensiveStatsComponent.ticksUntilCanAttack - 1)
        }
    }
}

export class AttackCommandSystem extends System {
    initialise(): void {
        const systemTypeKey = SystemTypes.AttackCommand

        const componentTypes = [
            ComponentTypes.Transform,
            ComponentTypes.Movement,
            ComponentTypes.OffensiveStats,
            ComponentTypes.AttackCommand,
            ComponentTypes.Pathing,
        ]

        this.coordinator.registerSystem<AttackCommandSystem>(systemTypeKey, this)

        const signature: Signature = new BitSet(MAX_SYSTEMS)
        for (const componentType of componentTypes) {
            signature.set(this.coordinator.getComponentType(componentType))
        }
        this.coordinator.setSystemSignature(signature, systemTypeKey)
    }  

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(_deltaTimeMs: number): void {
        
    }

    isTargetVisibleAndInRange(attackerTransformComponent: TransformComponent, attackerRange: number, targetTransformComponent: TransformComponent): boolean {
        // @TODO: be smarter about this
        const targetEdgeTiles = getAllEdgeTiles(targetTransformComponent)
        const attackerEdgeTiles = getAllEdgeTiles(attackerTransformComponent)

        for (const attackTile of attackerEdgeTiles) {
            for (const targetTile of targetEdgeTiles) {
                const canSeeTarget = calculateLosBetweenTwoTiles(attackTile, targetTile, this.coordinator.tileMap)
                const distanceToTarget = attackTile.tileDistanceTo(targetTile)

                if (canSeeTarget && distanceToTarget <= attackerRange) {
                    return true
                }
            }
        }

        return false
    }

    tick(): void {
        for (const entity of this.entities) {
            const attackerTransformComponent = this.coordinator.getComponent<TransformComponent>(entity, ComponentTypes.Transform)
            const movementComponent = this.coordinator.getComponent<MovementComponent>(entity, ComponentTypes.Movement)
            const offensiveStatsComponent = this.coordinator.getComponent<OffsensiveStatsComponent>(entity, ComponentTypes.OffensiveStats)
            const attackCommandComponent = this.coordinator.getComponent<AttackCommandComponent>(entity, ComponentTypes.AttackCommand)
            const pathingComponent = this.coordinator.getComponent<PathingComponent>(entity, ComponentTypes.Pathing)

            const targetTransformComponent = this.coordinator.getComponent<TransformComponent>(attackCommandComponent.target, ComponentTypes.Transform)
            const targetHealthComponent = this.coordinator.getComponent<HealthComponent>(attackCommandComponent.target, ComponentTypes.Health)

            if (targetHealthComponent.currentHealth <= 0) {
                this.coordinator.removeComponent(entity, ComponentTypes.AttackCommand)
                continue
            }

            // Clear movement
            movementComponent.movementPath = []
          
            // Calculate distance and can see from every edge tile
            let targetIsVisibleAndInRange = this.isTargetVisibleAndInRange(attackerTransformComponent, offensiveStatsComponent.attackRange, targetTransformComponent)

            // console.log(`canSee: ${canSeeTarget}`)
            // console.log(`distanceToTarget: ${distanceToTarget}`)
            // console.log(`offensiveStatsComponent.attackRange: ${offensiveStatsComponent.attackRange}`)

            if (!targetIsVisibleAndInRange) {
                // @TODO: player movement should not block, player movement should unblock tile under npc
                // Move                
                const path = pathingComponent.pathingFunction(attackerTransformComponent, targetTransformComponent, this.coordinator.getEngine())
                this.coordinator.getEngine().movementSystem.moveNow(this.coordinator, entity, path)

                // Dont calculate more if cant attack
                if (offensiveStatsComponent.ticksUntilCanAttack > 0) {
                    continue
                }
                targetIsVisibleAndInRange = this.isTargetVisibleAndInRange(attackerTransformComponent, offensiveStatsComponent.attackRange, targetTransformComponent)
            }

            if (targetIsVisibleAndInRange && offensiveStatsComponent.ticksUntilCanAttack <= 0) {
                // Attack
                if (offensiveStatsComponent.ticksUntilCanAttack <= 0) {
                    offensiveStatsComponent.createAttack(this.coordinator, entity, attackCommandComponent.target)
                    offensiveStatsComponent.ticksUntilCanAttack += offensiveStatsComponent.attackCooldown
                }
            }

        }
    }
}