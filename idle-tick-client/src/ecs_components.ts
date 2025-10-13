import type { CombatEngine } from "./combat_engine"
import type { Coordinator } from "./ecs"
import type { Entity, EquipmentSlotKeys, InventoryUseTypeKeys, PrayerKeys } from "./ecs_types"
import type { WorldPosition } from "./position"

export interface PlayerComponent {
    tag: boolean
}

export interface MovementComponent {
    moveSpeed: number,
    movementPath: WorldPosition[]
    renderTimeInTicks: number
    movementRenderData: MovementRenderData[]
}

export interface PathingComponent {
    pathingFunction: (currentPosition: TransformComponent, targetPosition: TransformComponent, engine: CombatEngine) => WorldPosition[]
}

export interface StaminaComponent {
    isRunning: boolean,
    currentStaminaPoints: number,
    maxStaminaPoints: number,
    staminaRegenRate: number,
}

export interface AttackCommandComponent {
    target: Entity,
}

export interface OffsensiveStatsComponent {
    attackLevel: number,
    strengthLevel: number,
    magicLevel: number,
    rangedLevel: number,

    stabAttackBonus: number,
    slashAttackBonus: number,
    crushAttackBonus:number,
    rangedAttackBonus: number,
    magicAttackBonus: number,

    meleeStrengthBonus: number,
    rangedStrengthBonus: number,
    magicDamageBonus: number,
    prayerBonus: number,

    attackRange: number
    ticksUntilCanAttack: number
    attackCooldown: number
    createAttack(coordinator: Coordinator, source: Entity, target: Entity): void,
}

export interface DefensiveStatsComponent {
    magicLevel: number,
    defenceLevel: number,

    stabDefenceBonus: number,
    slashDefenceBonus: number,
    crushDefenceBonus:number,
    rangedDefenceBonus: number,
    magicDefenceBonus: number,
}

export interface ModelComponent {
    currentModel: string
    animationPlayTimeTicks: number
    animationDurationTicks: number
    animationShouldLoop: boolean
    animationHasEnded: boolean
}

export interface TransformComponent {
    actualNorthWestPosition: WorldPosition
    renderNorthWestPosition: WorldPosition
    widthInTiles: number
    heightInTiles: number
}

export interface HealthComponent {
    currentHealth: number
    maxHealth: number
}

export interface HitSplatComponent {
    hitSplats: {damage: number, hitSplatType: string, ticksLeft: number}[]
}

export interface DamageReceiverComponent {
    damage: {source: Entity, damageAmount: number}[]
}

export interface PrayerComponent {
    currentPrayerPoints: number
    maxPrayerPoints: number
    activePrayers: Set<PrayerKeys>
}

export interface specialAttack {
    currentSpecialAttackPoints: number
    maxSpecialAttackPoints: number
}

export interface MovementRenderData {
    targetPosition: WorldPosition
    renderTimeInTicks: number
}

export interface SimpleBehaviourComponent {
    hasBehaviour: boolean
}

export interface HomingProjectileComponent {
    source: Entity
    ticksUntilImpact: number
    target: Entity // Must have transform component
    damage: number
    nullified: boolean
}

export interface InventoryComponent {
    slots: Array<Entity | null>
}

export interface ItemDetailsComponent {
    name: string
    description: string
    icon: string
    itemType: InventoryUseTypeKeys
}

export interface ArmourComponent {
    attackLevelRequirement: number,
    strengthLevelRequirement: number,
    rangedLevelRequirement: number,
    magicLevelRequirement: number,
    defenceLevelRequirement: number,

    stabAttackBonus: number,
    slashAttackBonus: number,
    crushAttackBonus:number,
    rangedAttackBonus: number,
    magicAttackBonus: number,

    stabDefenceBonus: number,
    slashDefenceBonus: number,
    crushDefenceBonus:number,
    rangedDefenceBonus: number,
    magicDefenceBonus: number,

    meleeStrengthBonus: number,
    rangedStrengthBonus: number,
    magicDamageBonus: number,
    prayerBonus: number,

    equipSlots: EquipmentSlotKeys[],
}

export interface WeaponComponent extends ArmourComponent {
    attackCooldown: number,
    attackRange: number,
    specialAttack: string,
}

export interface FoodComponent {
    healAmount: number
}

export interface PotionComponent {
    potionEffect: string,
}

export type PlayerEquipmentComponent = Record<EquipmentSlotKeys, Entity | null>