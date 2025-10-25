import type { Entity } from "./ecs_types";
import { ITEMS, type ItemKeys } from "./globals";

interface ConsumableInformation {
    itemID: ItemKeys
    usesLeft: number
    useFunction(user: Entity): void
}

const CONSUMABLE_MAP = new Map<ItemKeys, ConsumableInformation>([
    [ITEMS.HealthPotion, { itemID: ITEMS.HealthPotion, }],
    [ITEMS.PrayerPotion, { itemID: ITEMS.PrayerPotion, }],
])

function restoreHealth(user: Entity) {
    const healthCom
}