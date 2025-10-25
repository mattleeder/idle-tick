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

export interface AttackData {
    target: Entity,
}

export interface MoveData {
    destination: WorldPosition,
    path: WorldPosition[],
}

export interface AttackStyleChangeData {

}

export interface PrayerChangeData {
    prayer: PrayerKeys
}

export interface EquipmentChangeData {
    itemEntityToEquip: Entity
}

export interface UnequipData {
    slot: EquipmentSlotKeys
}

export type ConsumeFunction = (coordinator: Coordinator, consumingEntity: Entity) => void

export interface ConsumeData {
    itemEntity: Entity,
    invetoryPosition: number,
    consumeFunction: ConsumeFunction,
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
    queuedConsumable: ConsumeData | null

    constructor(coordinator: Coordinator) {
        this.coordinator = coordinator
        this.stackedAttacks = []
        this.queuedAttack = null
        this.queuedMovement = null
        this.queuedAttackStyleChange = null
        this.stackedPrayerChange = []
        this.stackedEquipmentChange = []
        this.stackedUnequip = []
        this.queuedConsumable = null
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

    queueConsumeItem(consumeData: ConsumeData) {
        this.queuedConsumable = consumeData
    }

    clearConsumeItem() {
        this.queuedConsumable = null
    }
}