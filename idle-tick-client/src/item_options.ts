import { Coordinator } from "./ecs"
import { HealthComponent, ItemDetailsComponent } from "./ecs_components"
import { ComponentTypes, type Entity } from "./ecs_types"
import { ITEMS, type ItemKeys } from "./globals"
import { UiEngineCommunicator } from "./ui_engine_communicator"

export const ItemOptionTypes = {
    Drink:          "drink",
    Drop:           "drop",
    Eat:            "eat",
    Equip:          "equip",
    Use:            "use",
}

export type ItemOptionTypeKeys = typeof ItemOptionTypes[keyof typeof ItemOptionTypes]

const Drink = ItemOptionTypes.Drink
const Drop = ItemOptionTypes.Drop
const Eat = ItemOptionTypes.Eat
const Equip = ItemOptionTypes.Equip
const Use = ItemOptionTypes.Use

type ItemUseFunction = (uiEngineCommunicator: UiEngineCommunicator, itemEntity: Entity, inventoryPosition: number) => void

export const ItemOptionsMap = new Map<ItemKeys, [ItemOptionTypeKeys, ItemUseFunction][]>([
    [ITEMS.TwistedBow, [
        [Equip, equipItem],
        [Use, useItem],
        [Drop, dropItem],
    ]],
    [ITEMS.FortifiedMasoriBody, [
        [Equip, equipItem],
        [Use, useItem],
        [Drop, dropItem],
    ]],
    [ITEMS.FortifiedMasoriChaps, [
        [Equip, equipItem],
        [Use, useItem],
        [Drop, dropItem],
    ]],
    [ITEMS.HealthPotionFourDose, [
        [Drink, restoreHealth],
        [Use, useItem],
        [Drop, dropItem],
    ]],
    [ITEMS.HealthPotionThreeDose, [
        [Drink, restoreHealth],
        [Use, useItem],
        [Drop, dropItem],
    ]],
    [ITEMS.HealthPotionTwoDose, [
        [Drink, restoreHealth],
        [Use, useItem],
        [Drop, dropItem],
    ]],
    [ITEMS.HealthPotionOneDose, [
        [Drink, restoreHealth],
        [Use, useItem],
        [Drop, dropItem],
    ]],
    [ITEMS.PrayerPotionFourDose, [
        [Drink, drinkItem],
        [Use, useItem],
        [Drop, dropItem],
    ]],
    [ITEMS.PrayerPotionThreeDose, [
        [Drink, drinkItem],
        [Use, useItem],
        [Drop, dropItem],
    ]],
    [ITEMS.PrayerPotionTwoDose, [
        [Drink, drinkItem],
        [Use, useItem],
        [Drop, dropItem],
    ]],
    [ITEMS.PrayerPotionOneDose, [
        [Drink, drinkItem],
        [Use, useItem],
        [Drop, dropItem],
    ]],
    [ITEMS.EmptyVial, [
        [Use, useItem],
        [Drop, dropItem],
    ]],
])
// [ITEMS.FortifiedMasoriBody, [Equip, Use, Drop]],
// [ITEMS.FortifiedMasoriChaps, [Equip, Use, Drop]],
// [ITEMS.HealthPotion, [Drink, Use, Drop]],
// [ITEMS.PrayerPotion, [Drink, Use, Drop]],/

function equipItem(uiEngineCommunicator: UiEngineCommunicator, itemEntity: Entity, inventoryPosition: number) {
    uiEngineCommunicator.queueEquipmentChange(itemEntity, inventoryPosition)
}

function useItem() {

}

function dropItem() {

}

function drinkItem() {

}

export function createItem(coordinator: Coordinator, itemKey: ItemKeys): Entity {
    const itemEntity = coordinator.createEntity()
    coordinator.addComponent(itemEntity, ComponentTypes.ItemDetails, {itemKey: itemKey})
    return itemEntity
}

export function clickOnItem(uiEngineCommunicator: UiEngineCommunicator, itemEntity: Entity, inventoryPosition: number, clickOption: number) {
    const itemDetailsComponent = uiEngineCommunicator.getItemDetails(itemEntity)
    const itemKey = itemDetailsComponent.itemKey
    const itemOptions = ItemOptionsMap.get(itemKey)
    if (itemOptions === undefined) {
        throw Error(`Could not find click options for ${itemKey} in position ${inventoryPosition}`)
    }

    const clickFunction = itemOptions[clickOption][1]
    clickFunction(uiEngineCommunicator, itemEntity, inventoryPosition)
}

function restoreHealth(uiEngineCommunicator: UiEngineCommunicator, itemEntity: Entity, inventoryPosition: number) {
    const consumeFunction = (coordinator: Coordinator, consumingEntity: Entity) => {
        const healthComponent = coordinator.getComponent<HealthComponent>(consumingEntity, ComponentTypes.Health)
        healthComponent.currentHealth = Math.min(healthComponent.maxHealth, healthComponent.currentHealth + 20)
        decrementConsumable(coordinator, itemEntity)
    }
    uiEngineCommunicator.queueConsumeItem(itemEntity, inventoryPosition, consumeFunction)
}

function decrementConsumable(coordinator: Coordinator, itemEntity: Entity) {
    const itemDetailsComponent = coordinator.getComponent<ItemDetailsComponent>(itemEntity, ComponentTypes.ItemDetails)
    itemDetailsComponent.itemKey

}