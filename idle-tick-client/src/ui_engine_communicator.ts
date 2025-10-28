import type { CombatUIData } from "./access_player_data";
import type { CombatEngine } from "./combat_engine";
import type { AttackData, CombatInputQueue, ConsumeData, MoveData, PrayerChangeData } from "./combat_input_queue";
import type { Coordinator } from "./ecs";
import { type InventoryComponent, type PlayerEquipmentComponent, type ItemDetailsComponent, type HealthComponent, type StaminaComponent, type PrayerComponent, type MovementComponent, OffsensiveStatsComponent, DefensiveStatsComponent } from "./ecs_components";
import { StaminaSystem } from "./ecs_systems";
import { ComponentTypes, type Entity, type EquipmentSlotKeys, type PrayerKeys } from "./ecs_types";
import { INVENTORY_SIZE } from "./globals";
import type { uiCallbackFn } from "./ui/interactive_element";
import type { UiGroup } from "./ui/ui_group";
import { arraysAreEqual } from "./utilities";

export class UiEngineCommunicator {
    private coordinator: Coordinator
    private engine: CombatEngine
    private playerEntity: Entity
    private inputQueue: CombatInputQueue

    private _playerCurrentInventory: Array<Entity | null>
    private _playerCurrentEquipment: PlayerEquipmentComponent
    private _playerCurrentActivePrayers: Set<PrayerKeys>

    private playerInventoryChangeListeners: uiCallbackFn[]
    private playerEquipmentChangeListeners: uiCallbackFn[]
    private playerPrayerChangeListeners: uiCallbackFn[]
    private playerStaminaAtZeroListeners: uiCallbackFn[]

    constructor(coordinator: Coordinator, engine: CombatEngine, playerEntity: Entity, inputQueue: CombatInputQueue) {
        this.playerEntity = playerEntity
        this.engine = engine
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
        this.playerStaminaAtZeroListeners = []
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

    onPlayerZeroStamina(callbackFn: uiCallbackFn) {
        this.playerStaminaAtZeroListeners.push(callbackFn)
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

        const playerStaminaComponent = this.coordinator.getComponent<StaminaComponent>(this.playerEntity, ComponentTypes.Stamina)
        if (playerStaminaComponent.currentStaminaPoints <= 0) {
            for (const callbackFn of this.playerStaminaAtZeroListeners) {
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

    getCoordinator(): Coordinator {
        return this.coordinator
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

    getCameraRotationAngle() {
        return this.coordinator.camera.rotationAngle
    }

    setCameraRotationAngle(rotationAngle: number) {
        return this.coordinator.camera.setRotationAngle(rotationAngle)
    }

    getCameraBaseTileSize() {
        return this.coordinator.camera.baseTileSize
    }

    isPlayerRunning() {
        const staminaComponent = this.coordinator.getComponent<StaminaComponent>(this.playerEntity, ComponentTypes.Stamina)
        return staminaComponent.isRunning
    }

    turnOffRun() {
        const staminaComponent = this.coordinator.getComponent<StaminaComponent>(this.playerEntity, ComponentTypes.Stamina)
        const movementComponent = this.coordinator.getComponent<MovementComponent>(this.playerEntity, ComponentTypes.Movement)
        StaminaSystem.turnOffRun(staminaComponent, movementComponent)
        
    }

    turnOnRun() {
        const staminaComponent = this.coordinator.getComponent<StaminaComponent>(this.playerEntity, ComponentTypes.Stamina)
        const movementComponent = this.coordinator.getComponent<MovementComponent>(this.playerEntity, ComponentTypes.Movement)
        StaminaSystem.turnOnRun(staminaComponent, movementComponent)
    }

    queueConsumeItem(itemEntity: Entity, inventoryPosition: number, consumeFunction: (coordinator: Coordinator, consumingEntity: Entity) => void) {
        const consumeData: ConsumeData = {
            itemEntity: itemEntity,
            invetoryPosition: inventoryPosition,
            consumeFunction: consumeFunction,
        }
        this.inputQueue.queueConsumeItem(consumeData)
    }

    openWindow(windowGroup: UiGroup) {
        for (const element of this.engine.uiManager.baseUiGroup.children) {
            if (element === windowGroup) {
                windowGroup.isActive = true
            }
        }
    }

    closeWindow(windowGroup: UiGroup) {
        for (const element of this.engine.uiManager.baseUiGroup.children) {
            if (element === windowGroup) {
                windowGroup.isActive = false
            }
        }
    }

    getEquipmentWindowInformation() {
        const offensiveStatsComponent = this.coordinator.getComponent<OffsensiveStatsComponent>(this.playerEntity, ComponentTypes.OffensiveStats)
        const defensiveStatsComponent = this.coordinator.getComponent<DefensiveStatsComponent>(this.playerEntity, ComponentTypes.DefensiveStats)

        return {
            "Attack": {
                "Stab": offensiveStatsComponent.stabAttackBonus,
                "Slash": offensiveStatsComponent.slashAttackBonus,
                "Crush": offensiveStatsComponent.crushAttackBonus,
                "Magic": offensiveStatsComponent.magicAttackBonus,
                "Range": offensiveStatsComponent.rangedAttackBonus,
            },

            "Defence": {
                "Stab": defensiveStatsComponent.stabDefenceBonus,
                "Slash": defensiveStatsComponent.slashDefenceBonus,
                "Crush": defensiveStatsComponent.crushDefenceBonus,
                "Magic": defensiveStatsComponent.magicDefenceBonus,
                "Range": defensiveStatsComponent.rangedDefenceBonus,
            },

            "Other": {
                "Melee Strength": offensiveStatsComponent.meleeStrengthBonus,
                "Ranged Strength": offensiveStatsComponent.rangedStrengthBonus,
                "Magic DMG": offensiveStatsComponent.magicDamageBonus,
                "Prayer": offensiveStatsComponent.prayerBonus,
                "Weapon Speed": offensiveStatsComponent.attackCooldown,
                "Weapon Range": offensiveStatsComponent.attackRange,
            }
        }
    }
}