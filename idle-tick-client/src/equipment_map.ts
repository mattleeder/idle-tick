import type { DefensiveStatsComponent, OffsensiveStatsComponent } from "./ecs_components"
import { EquipmentSlots, type EquipmentSlotKeys } from "./ecs_types"
import { PLAYER_UNARMED_ATTACK_RANGE, PLAYER_UNARMED_ATTACK_SPEED } from "./globals"

type ItemID = number

// @TODO:
//  - Models
//  - Animations
//  - Projectiles
//  - On hit effects
//  - Special attacks
//  - isMainHand could be replaced by some kind of equip slots check

export interface Requirements {
    attackLevel: number,
    strengthLevel: number,
    defenceLevel: number,
    magicLevel: number,
    rangedLevel: number,
}

type Partial<T> = {
  [P in keyof T]?: T[P]
}

type PartialRequirements = Partial<Requirements>

export interface ArmourStats {
    stabAttackBonus: number,
    slashAttackBonus: number,
    crushAttackBonus: number,
    magicAttackBonus: number,
    rangedAttackBonus: number,

    stabDefenceBonus: number,
    slashDefenceBonus: number,
    crushDefenceBonus:number,
    magicDefenceBonus: number,
    rangedDefenceBonus: number,

    meleeStrengthBonus: number,
    rangedStrengthBonus: number,
    magicDamageBonus: number,
    prayerBonus: number,

    equipSlots: EquipmentSlotKeys[],
}

export interface WeaponStats extends ArmourStats {
    attackStyles: AttackStylesData[],
    specialAttack: string,
}

export interface AttackStylesData {
    name: string,
    attackSpeed: number,
    attackRange: number,
}

interface PartialArmourStats {
    stabAttackBonus?: number,
    slashAttackBonus?: number,
    crushAttackBonus?: number,
    magicAttackBonus?: number,
    rangedAttackBonus?: number,

    stabDefenceBonus?: number,
    slashDefenceBonus?: number,
    crushDefenceBonus?:number,
    magicDefenceBonus?: number,
    rangedDefenceBonus?: number,

    meleeStrengthBonus?: number,
    rangedStrengthBonus?: number,
    magicDamageBonus?: number,
    prayerBonus?: number,

    equipSlots: EquipmentSlotKeys[],
}

interface PartialWeaponStats extends PartialArmourStats {
    attackStyles: AttackStylesData[],
    specialAttack?: string,
}

interface EquipmentInformation {
    itemID: ItemID
    isMainHand: boolean
    requirements: Requirements
    equipmentStats: WeaponStats | ArmourStats
}


const EQUIPMENT_MAP = new Map<ItemID, EquipmentInformation>()

const twistedBow: EquipmentInformation = {
    itemID: 1,
    isMainHand: true,
    requirements: equipmentRequirementsFactory({
        rangedLevel: 85,
    }),
    equipmentStats: weaponStatsFactory({
        rangedAttackBonus: 70,
        rangedStrengthBonus: 20,
        attackStyles: [
            {
                name: "accurate",
                attackSpeed: 6,
                attackRange: 10,
            },
            {
                name: "rapid",
                attackSpeed: 5,
                attackRange: 10,
            },
            {
                name: "longrange",
                attackSpeed: 6,
                attackRange: 10,
            }
        ],
        equipSlots: [EquipmentSlots.MainHand, EquipmentSlots.OffHand],
    }),
}

const fortifiedMasoriBody: EquipmentInformation = {
    itemID: 2,
    isMainHand: false,
    requirements: equipmentRequirementsFactory({
        rangedLevel: 80,
        defenceLevel: 80,
    }),
    equipmentStats: armourStatsFactory({
        magicAttackBonus: -4,
        rangedAttackBonus: 43,

        stabDefenceBonus: 59,
        slashDefenceBonus: 52,
        crushDefenceBonus: 64,
        magicDefenceBonus: 74,
        rangedDefenceBonus: 60,

        rangedStrengthBonus: 4,
        prayerBonus: 1,

        equipSlots: [EquipmentSlots.Chest],
    })
}

const fortifiedMasoriChaps: EquipmentInformation = {
    itemID: 3,
    isMainHand: false,
    requirements: equipmentRequirementsFactory({
        rangedLevel: 80,
        defenceLevel: 80,
    }),
    equipmentStats: armourStatsFactory({
        magicAttackBonus: -2,
        rangedAttackBonus: 27,

        stabDefenceBonus: 26,
        slashDefenceBonus: 24,
        crushDefenceBonus: 29,
        magicDefenceBonus: 19,
        rangedDefenceBonus: 22,

        rangedStrengthBonus: 2,

        equipSlots: [EquipmentSlots.Legs],
    })
}

export function meetsRequirements(itemID: ItemID, offensiveStatsComponent: OffsensiveStatsComponent, defensiveStatsComponent: DefensiveStatsComponent) {
    const equipmentInformation = EQUIPMENT_MAP.get(itemID)
    if (equipmentInformation === undefined) {
        throw new Error(`equipment information for itemID: ${itemID} could not be found when checking requirements`)
    }

    const equipmentRequirements = equipmentInformation.requirements

    const requirementsArray = [
        offensiveStatsComponent.attackLevel >= equipmentRequirements.attackLevel,
        offensiveStatsComponent.strengthLevel >= equipmentRequirements.strengthLevel,
        offensiveStatsComponent.magicLevel >= equipmentRequirements.magicLevel,
        offensiveStatsComponent.rangedLevel >= equipmentRequirements.rangedLevel,
        defensiveStatsComponent.defenceLevel >= equipmentRequirements.defenceLevel,
    ]

    for (const requirement of requirementsArray) {
        if (!requirement) {
            return false
        }
    }

    return true
}

function equipmentRequirementsFactory(partialRequirements: PartialRequirements) {
    const requirements: Requirements = {
        attackLevel: 1,
        strengthLevel: 1,
        defenceLevel: 1,
        magicLevel: 1,
        rangedLevel: 1,
        ...partialRequirements
    }

    return requirements
}

function weaponStatsFactory(partialWeaponStats: PartialWeaponStats): WeaponStats {
    const weaponStats: WeaponStats = {
        stabAttackBonus: 0,
        slashAttackBonus: 0,
        crushAttackBonus: 0,
        magicAttackBonus: 0,
        rangedAttackBonus: 0,

        stabDefenceBonus: 0,
        slashDefenceBonus: 0,
        crushDefenceBonus:0,
        magicDefenceBonus: 0,
        rangedDefenceBonus: 0,

        meleeStrengthBonus: 0,
        rangedStrengthBonus: 0,
        magicDamageBonus: 0,

        prayerBonus: 0,

        specialAttack: "",

        ...partialWeaponStats
    }

    return weaponStats
}

function armourStatsFactory(partialArmourStats: PartialArmourStats): ArmourStats {
    const armourStats: ArmourStats = {
        stabAttackBonus: 0,
        slashAttackBonus: 0,
        crushAttackBonus: 0,
        magicAttackBonus: 0,
        rangedAttackBonus: 0,

        stabDefenceBonus: 0,
        slashDefenceBonus: 0,
        crushDefenceBonus:0,
        magicDefenceBonus: 0,
        rangedDefenceBonus: 0,

        meleeStrengthBonus: 0,
        rangedStrengthBonus: 0,
        magicDamageBonus: 0,

        prayerBonus: 0,

        ...partialArmourStats
    }

    return armourStats
}

export function addEquipmentStatsToOffensiveStats(itemID: ItemID, offensiveStatsComponent: OffsensiveStatsComponent) {
    const equipmentInformation = EQUIPMENT_MAP.get(itemID)
    if (equipmentInformation === undefined) {
        throw new Error(`equipment information for itemID: ${itemID} could not be found when adding equipment stats to offensive stats`)
    }

    const equipmentStats = equipmentInformation.equipmentStats

    offensiveStatsComponent.stabAttackBonus += equipmentStats.stabAttackBonus
    offensiveStatsComponent.slashAttackBonus += equipmentStats.slashAttackBonus
    offensiveStatsComponent.crushAttackBonus += equipmentStats.crushAttackBonus
    offensiveStatsComponent.rangedAttackBonus += equipmentStats.rangedAttackBonus
    offensiveStatsComponent.magicAttackBonus += equipmentStats.magicAttackBonus

    offensiveStatsComponent.meleeStrengthBonus += equipmentStats.meleeStrengthBonus
    offensiveStatsComponent.rangedStrengthBonus += equipmentStats.rangedStrengthBonus
    offensiveStatsComponent.magicDamageBonus += equipmentStats.magicDamageBonus

    if (equipmentInformation.isMainHand) {
        offensiveStatsComponent.attackRange = (equipmentStats as WeaponStats).attackStyles[0].attackRange
        offensiveStatsComponent.attackCooldown = (equipmentStats as WeaponStats).attackStyles[0].attackSpeed
    }

}

export function subtractEquipmentStatsFromOffensiveStats(itemID: ItemID, offensiveStatsComponent: OffsensiveStatsComponent) {
    const equipmentInformation = EQUIPMENT_MAP.get(itemID)
    if (equipmentInformation === undefined) {
        throw new Error(`equipment information for itemID: ${itemID} could not be found when subtracting equipment stats from offensive stats`)
    }

    const equipmentStats = equipmentInformation.equipmentStats

    offensiveStatsComponent.stabAttackBonus -= equipmentStats.stabAttackBonus
    offensiveStatsComponent.slashAttackBonus -= equipmentStats.slashAttackBonus
    offensiveStatsComponent.crushAttackBonus -= equipmentStats.crushAttackBonus
    offensiveStatsComponent.rangedAttackBonus -= equipmentStats.rangedAttackBonus
    offensiveStatsComponent.magicAttackBonus -= equipmentStats.magicAttackBonus

    offensiveStatsComponent.meleeStrengthBonus -= equipmentStats.meleeStrengthBonus
    offensiveStatsComponent.rangedStrengthBonus -= equipmentStats.rangedStrengthBonus
    offensiveStatsComponent.magicDamageBonus -= equipmentStats.magicDamageBonus

    if (equipmentInformation.isMainHand) {
        offensiveStatsComponent.attackRange = PLAYER_UNARMED_ATTACK_RANGE
        offensiveStatsComponent.attackCooldown = PLAYER_UNARMED_ATTACK_SPEED
    }

}

export function addEquipmentStatsToDefensiveStats(itemID: ItemID, defensiveStatsComponent: DefensiveStatsComponent) {
    const equipmentInformation = EQUIPMENT_MAP.get(itemID)
    if (equipmentInformation === undefined) {
        throw new Error(`equipment information for itemID: ${itemID} could not be found when adding equipment stats to defensive stats`)
    }

    const equipmentStats = equipmentInformation.equipmentStats

    defensiveStatsComponent.stabDefenceBonus += equipmentStats.stabDefenceBonus
    defensiveStatsComponent.slashDefenceBonus += equipmentStats.slashDefenceBonus
    defensiveStatsComponent.crushDefenceBonus += equipmentStats.crushDefenceBonus
    defensiveStatsComponent.rangedDefenceBonus += equipmentStats.rangedDefenceBonus
    defensiveStatsComponent.magicDefenceBonus += equipmentStats.magicDefenceBonus

}

export function subtractEquipmentStatsFromDefensiveStats(itemID: ItemID, defensiveStatsComponent: DefensiveStatsComponent) {
    const equipmentInformation = EQUIPMENT_MAP.get(itemID)
    if (equipmentInformation === undefined) {
        throw new Error(`equipment information for itemID: ${itemID} could not be found when subtracting equipment stats from defensive stats`)
    }

    const equipmentStats = equipmentInformation.equipmentStats

    defensiveStatsComponent.stabDefenceBonus -= equipmentStats.stabDefenceBonus
    defensiveStatsComponent.slashDefenceBonus -= equipmentStats.slashDefenceBonus
    defensiveStatsComponent.crushDefenceBonus -= equipmentStats.crushDefenceBonus
    defensiveStatsComponent.rangedDefenceBonus -= equipmentStats.rangedDefenceBonus
    defensiveStatsComponent.magicDefenceBonus -= equipmentStats.magicDefenceBonus

}

const items = [
    twistedBow,
    fortifiedMasoriBody,
    fortifiedMasoriChaps,
]

for (const item of items) {
    if (EQUIPMENT_MAP.has(item.itemID)) {
        throw new Error(`itemID: ${item.itemID} already exists`)
    }
    EQUIPMENT_MAP.set(item.itemID, item)
}