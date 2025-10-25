// CAMERA
export const CAMERA_MIN_ZOOM_LEVEL = 0.1
export const CAMERA_MAX_ZOOM_LEVEL = 10

// ENGINE
export const MOUSE_SENSITIVITY = 1
export const TICK_RATE_MS = 600 // 0.6s
export const TILE_SIZE_PIXELS = 64


// ECS
export const MAX_ENTITIES = 5_000
export const MAX_COMPONENTS = 10
export const MAX_SYSTEMS = 64

export const INVENTORY_SIZE = 28
export const INVENTORY_COLUMNS = 4
export const INVENTORY_ROWS = 7
export const INVENTORY_BUTTON_FLASH_DURATION_MS = 200

export const PLAYER_WALK_SPEED = 1
export const PLAYER_RUN_SPEED = 2

export const PLAYER_UNARMED_ATTACK_RANGE = 1
export const PLAYER_UNARMED_ATTACK_SPEED = 4

// Images
export const protectFromMagicIcon = new Image()
protectFromMagicIcon.src = "src/assets/protect_from_magic.png"

export const protectFromRangedIcon = new Image()
protectFromRangedIcon.src = "src/assets/protect_from_ranged.png"

export const protectFromMeleeIcon = new Image()
protectFromMeleeIcon.src = "src/assets/protect_from_melee.png"

// Item List

export const ITEMS = {
    TwistedBow:                 "twistedBow",
    FortifiedMasoriBody:        "fortifiedMasoriBody",
    FortifiedMasoriChaps:       "fortifiedMasoriChaps",
    HealthPotionFourDose:       "healthPotionFourDose",
    HealthPotionThreeDose:      "healthPotionThreeDose",
    HealthPotionTwoDose:        "healthPotionTwoDose",
    HealthPotionOneDose:        "healthPotionOneDose",
    PrayerPotionFourDose:       "prayerPotionFourDose",
    PrayerPotionThreeDose:      "prayerPotionThreeDose",
    PrayerPotionTwoDose:        "prayerPotionTwoDose",
    PrayerPotionOneDose:        "prayerPotionOneDose",
    EmptyVial:                  "emptyVial",
} as const

export type ItemKeys = typeof ITEMS[keyof typeof ITEMS]

export const ITEM_MODELS_LOCATION = "src/assets/item_models/"
export const ITEM_MODELS_FILE_EXTENSION = ".png"