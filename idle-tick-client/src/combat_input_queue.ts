/*

There are 3 types of clicks:
    1. UI Click
    2. Action Click
    3. Movement Click

These clicks can happen:
    1. Immidiately
    2. On the next tick

The clicks can:
    1. Stack (Zero tick attacks)
    2. Overwrite (Prayer change)

*/

import type { Coordinator } from "./ecs";
import { type Entity, type EquipmentSlotKeys, type PrayerKeys } from "./ecs_types";
import type { WorldPosition } from "./position";

interface AttackData {
    target: Entity,
}

interface MoveData {
    destination: WorldPosition,
    path: WorldPosition[],
}

interface AttackStyleChangeData {

}

interface PrayerChangeData {
    prayer: PrayerKeys
}

interface EquipmentChangeData {
    itemEntityToEquip: Entity
}

interface UnequipData {
    slot: EquipmentSlotKeys
}

interface PotionData {

}

interface FoodData {

}

export class CombatInputQueue {
    coordinator: Coordinator;
    stackedAttacks: AttackData[];
    queuedAttack: AttackData | null;
    queuedMovement: MoveData | null;
    queuedAttackStyleChange: AttackStyleChangeData | null;
    stackedPrayerChange: PrayerChangeData[];
    stackedEquipmentChange: EquipmentChangeData[];
    stackedUnequip: UnequipData[];
    queuedPotion: PotionData | null;
    queuedFood: FoodData | null;

    constructor(coordinator: Coordinator) {
        this.coordinator = coordinator
        this.stackedAttacks = []
        this.queuedAttack = null
        this.queuedMovement = null
        this.queuedAttackStyleChange = null
        this.stackedPrayerChange = []
        this.stackedEquipmentChange = []
        this.stackedUnequip = []
        this.queuedPotion = null
        this.queuedFood = null
    }

    stackAttack() {

    }

    queueAttack(attackData: AttackData) {
        this.clearMovement()
        this.queuedAttack = attackData
    }

    clearAttack() {
        this.queuedAttack = null
    }

    queueMovement(move: MoveData) {
        this.clearAttack()
        this.queuedMovement = move
    }

    clearMovement() {
        this.queuedMovement = null
    }

    queueAttackStyleChange() {

    }

    queuePrayerChange(prayer: PrayerChangeData) {
        this.stackedPrayerChange.push(prayer)
    }

    clearPrayerChange() {
        this.stackedPrayerChange = []
    }

    queueEquipmentChange(itemEntity: Entity) {
        this.stackedEquipmentChange.push({itemEntityToEquip: itemEntity})
    }

    clearEquipmentChange() {
        this.stackedEquipmentChange = []
    }

    queueUnequip(slot: EquipmentSlotKeys) {
        this.stackedUnequip.push({slot: slot})
    }

    clearUnequip() {
        this.stackedUnequip = []
    }

    queueUsePotion() {

    }

    queueEatFood() {

    }
}