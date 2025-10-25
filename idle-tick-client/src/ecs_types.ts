import type { BitSet } from "./bitSet"

export type Entity = number
export type ComponentType = number
export type Signature = BitSet

export const ComponentTypes = {
    Transform:          "transform",
    Stamina:            "stamina",
    Movement:           "movement",
    Model:              "model",
    Health:             "health",
    DamageReceiver:     "damageReceiver",
    HitSplat:           "hitSplat",
    SimpleBehaviour:    "simpleBehaviour",
    OffensiveStats:     "offensiveStats",
    DefensiveStats:     "defensiveStats",
    HomingProjectile:   "homingProjectile",
    Inventory:          "inventory",
    ItemDetails:        "itemDetails",
    PlayerEquipment:    "playerEquipment",
    Prayer:             "prayer",
    AttackCommand:      "attackCommand",
    Pathing:            "pathing",
    Player:             "player",
} as const

export type ComponentTypeKeys = typeof ComponentTypes[keyof typeof ComponentTypes]

export const SystemTypes = {
    Stamina:            "stamina",
    Movement:           "movement",
    Animation:          "animation",
    DamageReceiver:     "damageReceiver",
    SimpleBehaviour:    "simpleBehaviour",
    HomingProjectile:   "homingProjectile",
    Inventory:          "inventory",
    PlayerEquipment:    "playerEquipment",
    Prayer:             "prayer",
    AttackCooldown:     "attackCooldown",
    AttackCommand:      "attackCommand",

    ModelRender:         "modelRender",
    HitSplatRender:      "hitSplatRender",
    HealthBarRender:     "healthBarRender",
    PrayerRender:        "prayerRender",
} as const

export type SystemTypeKeys = typeof SystemTypes[keyof typeof SystemTypes]

export const Prayers = {
    ProtectMelee:   "protectMelee",
    ProtectRange:   "protectRange",
    ProtectMage:    "protectMage",
} as const

export type PrayerKeys = typeof Prayers[keyof typeof Prayers]

export const EquipmentSlots = {
    Head:           "head",
    Chest:          "chest",
    Legs:           "legs",
    MainHand:       "mainHand",
    OffHand:        "offHand",
    Boots:          "boots",
    Gloves:         "gloves",
    Ring:           "ring",
    Neck:           "neck",
    Cape:           "cape",
    Ammo:           "ammo",
} as const

export type EquipmentSlotKeys = typeof EquipmentSlots[keyof typeof EquipmentSlots]

const equipmentSlotValues = Object.values(EquipmentSlots) as EquipmentSlotKeys[];

// Type guard function
export function isEquipmentSlotKeys(value: unknown): value is EquipmentSlotKeys {
    return typeof value === 'string' && equipmentSlotValues.includes(value as EquipmentSlotKeys);
}