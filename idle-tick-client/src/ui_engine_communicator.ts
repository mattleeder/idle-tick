import type { CombatUIData } from "./access_player_data";
import type { AttackData, CombatInputQueue, MoveData, PrayerChangeData } from "./combat_input_queue";
import type { Coordinator } from "./ecs";
import type { InventoryComponent, PlayerEquipmentComponent, ItemDetailsComponent, HealthComponent, StaminaComponent, PrayerComponent } from "./ecs_components";
import { ComponentTypes, type Entity, type EquipmentSlotKeys, type PrayerKeys } from "./ecs_types";
import { INVENTORY_SIZE } from "./globals";
import type { uiCallbackFn } from "./ui/interactive_element";
import { arraysAreEqual } from "./utilities";

export class UiEngineCommunicator {
    private coordinator: Coordinator
    private playerEntity: Entity
    private inputQueue: CombatInputQueue

    private _playerCurrentInventory: Array<Entity | null>
    private _playerCurrentEquipment: PlayerEquipmentComponent
    private _playerCurrentActivePrayers: Set<PrayerKeys>

    private playerInventoryChangeListeners: uiCallbackFn[]
    private playerEquipmentChangeListeners: uiCallbackFn[]
    private playerPrayerChangeListeners: uiCallbackFn[]

    constructor(coordinator: Coordinator, playerEntity: Entity, inputQueue: CombatInputQueue) {
        this.playerEntity = playerEntity
        this.coordinator = coordinator
        this.inputQueue = inputQueue

        this._playerCurrentInventory = Array(28).fill(null)
        this._playerCurrentEquipment = {
            head:           null,
            chest:          null,
            legs:           null,
            mainHand:       null,
            offHand:        null,
            boots:          null,
            gloves:         null,
            ring:           null,
            neck:           null,
            cape:           null,
            ammo:           null,
        }
        this._playerCurrentActivePrayers = new Set 

        this.playerInventoryChangeListeners = []
        this.playerEquipmentChangeListeners = []
        this.playerPrayerChangeListeners = []
    }

    onPlayerInventoryChange(callbackFn: uiCallbackFn) {
        this.playerInventoryChangeListeners.push(callbackFn)
    }

    onPlayerEquipmentChange(callbackFn: uiCallbackFn) {
        this.playerEquipmentChangeListeners.push(callbackFn)
    }

    onPlayerActivePrayerChange(callbackFn: uiCallbackFn) {
        this.playerPrayerChangeListeners.push(callbackFn)
    }

    tick() {
        // @TODO: consider putting listeners on ecs systems to trigger changes
        // @TODO: consider explicitly updating the changed items
        const newPlayerInventory = this.getPlayerInventory()
        const newPlayerEquipment = this.getPlayerEquipment()
        const newPlayerPrayer = this.getPlayerActivePrayer()

        // @TODO: are these copies needed?
        if (!arraysAreEqual(newPlayerInventory, this.playerCurrentInventory)) {
            console.log("INVENTORY CHANGED")
            this.playerCurrentInventory = [...newPlayerInventory]
            for (const callbackFn of this.playerInventoryChangeListeners) {
                callbackFn()
            }
        }

        if (newPlayerEquipment != this.playerCurrentEquipment) {
            this.playerCurrentEquipment = {...newPlayerEquipment}
            for (const callbackFn of this.playerEquipmentChangeListeners) {
                callbackFn()
            }
        }

        if (newPlayerPrayer != this.playerCurrentActivePrayers) {
            this.playerCurrentActivePrayers = new Set(newPlayerPrayer)
            for (const callbackFn of this.playerPrayerChangeListeners) {
                callbackFn()
            }
        }
    }

    get playerCurrentInventory() {
        return this._playerCurrentInventory
    }

    get playerCurrentEquipment() {
        return this._playerCurrentEquipment
    }

    get playerCurrentActivePrayers() {
        return this._playerCurrentActivePrayers
    }

    set playerCurrentInventory(newPlayerInventory: Array<Entity | null>) {
        this._playerCurrentInventory = newPlayerInventory
    }

    set playerCurrentEquipment(newPlayerEquipment: PlayerEquipmentComponent) {
        this._playerCurrentEquipment = newPlayerEquipment
    }

    set playerCurrentActivePrayers(newPlayerPrayers: Set<PrayerKeys>) {
        this._playerCurrentActivePrayers = newPlayerPrayers
    }


    private getPlayerInventory(): Array<Entity | null> {
        const playerInventoryComponent = this.coordinator.getComponent<InventoryComponent>(this.playerEntity, ComponentTypes.Inventory)
        return playerInventoryComponent.slots
    }

    private getPlayerEquipment(): PlayerEquipmentComponent {
        const playerEquipmentComponent = this.coordinator.getComponent<PlayerEquipmentComponent>(this.playerEntity, ComponentTypes.PlayerEquipment)
        return playerEquipmentComponent
    }

    private getPlayerActivePrayer(): Set<PrayerKeys> {
        const playerPrayerComponent = this.coordinator.getComponent<PrayerComponent>(this.playerEntity, ComponentTypes.Prayer)
        return playerPrayerComponent.activePrayers
    }

    getItemDetails(itemEntity: Entity): ItemDetailsComponent {
        const itemDetailsComponent = this.coordinator.getComponent<ItemDetailsComponent>(itemEntity, ComponentTypes.ItemDetails)
        return itemDetailsComponent
    }

    getCombatUIData = (): CombatUIData => {
        const playerHealthComponent = this.coordinator.getComponent<HealthComponent>(this.playerEntity, ComponentTypes.Health)
        const playerStaminaComponent = this.coordinator.getComponent<StaminaComponent>(this.playerEntity, ComponentTypes.Stamina)
        const playerInventoryComponent = this.coordinator.getComponent<InventoryComponent>(this.playerEntity, ComponentTypes.Inventory)
        const playerInventoryItemDetails = Array(28).fill(null)

        for (let i = 0; i < INVENTORY_SIZE; i++) {
            const itemEntity = playerInventoryComponent.slots[i]
            if (itemEntity !== null) {
                const itemDetailsComponent = this.coordinator.getComponent<ItemDetailsComponent>(itemEntity, ComponentTypes.ItemDetails)
                playerInventoryItemDetails[i] = itemDetailsComponent
            }
        }

        // @TODO: get real data
        return {
            playerCurrentHealth: playerHealthComponent.currentHealth,
            playerMaxHealth: playerHealthComponent.maxHealth,

            playerCurrentStamina: playerStaminaComponent.currentStaminaPoints,
            playerMaxStamina: playerStaminaComponent.maxStaminaPoints,

            playerCurrentPrayerPoints: 99,
            playerMaxPrayerPoints: 99,

            playerCurrentSpecialAttack: 100,
            playerMaxSpecialAttack: 100,

            playerInventory: playerInventoryItemDetails,
        }
    }

    stackAttack() {
        this.inputQueue.stackAttack()
    }

    queueAttack(attackData: AttackData) {
        this.inputQueue.queueAttack(attackData)
    }

    clearAttack() {
        this.inputQueue.clearAttack()
    }

    queueMovement(move: MoveData) {
        this.inputQueue.queueMovement(move)
    }

    clearMovement() {
        this.inputQueue.clearMovement()
    }

    queueAttackStyleChange() {
        this.inputQueue.queueAttackStyleChange()
    }

    queuePrayerChange(prayer: PrayerChangeData) {
        this.inputQueue.queuePrayerChange(prayer)
    }

    clearPrayerChange() {
        this.inputQueue.clearPrayerChange()
    }

    queueEquipmentChange(itemEntity: Entity, inventorySlotNumber: number) {
        this.inputQueue.queueEquipmentChange(itemEntity)
    }

    clearEquipmentChange() {
        this.inputQueue.clearEquipmentChange()
    }

    queueUnequip(slot: EquipmentSlotKeys) {
        this.inputQueue.queueUnequip(slot)
    }

    clearUnequip() {
        this.inputQueue.clearUnequip()
    }

    queueUsePotion() {
        this.inputQueue.queueUsePotion()
    }

    queueEatFood() {
        this.inputQueue.queueEatFood()
    }

    getCameraRotationAngle() {
        return this.coordinator.camera.rotationAngle
    }

    setCameraRotationAngle(rotationAngle: number) {
        return this.coordinator.camera.setRotationAngle(rotationAngle)
    }

    getCameraBaseTileSize() {
        return this.coordinator.camera.baseTileSize
    }
}