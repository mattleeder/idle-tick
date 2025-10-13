import type { CombatInputQueue } from "./combat_input_queue";
import type { Coordinator } from "./ecs";
import type { HealthComponent, InventoryComponent, ItemDetailsComponent, PlayerEquipmentComponent, StaminaComponent } from "./ecs_components";
import { ComponentTypes, type Entity } from "./ecs_types";
import { INVENTORY_SIZE } from "./globals";

export interface CombatUIData {
    playerMaxHealth: number
    playerCurrentHealth: number

    playerMaxStamina: number
    playerCurrentStamina: number
    
    playerMaxSpecialAttack: number
    playerCurrentSpecialAttack: number

    playerMaxPrayerPoints: number
    playerCurrentPrayerPoints: number

    playerInventory: Array<ItemDetailsComponent | null>
}

export class PlayerDataGrabber {
    private coordinator: Coordinator
    playerEntity: Entity
    inputQueue: CombatInputQueue

    constructor(coordinator: Coordinator, playerEntity: Entity, inputQueue: CombatInputQueue) {
        this.playerEntity = playerEntity
        this.coordinator = coordinator
        this.inputQueue = inputQueue
    }

    getInventory(): Array<Entity | null> {
        const playerInventoryComponent = this.coordinator.getComponent<InventoryComponent>(this.playerEntity, ComponentTypes.Inventory)
        return playerInventoryComponent.slots
    }

    getEquipment(): PlayerEquipmentComponent {
        const playerEquipmentComponent = this.coordinator.getComponent<PlayerEquipmentComponent>(this.playerEntity, ComponentTypes.PlayerEquipment)
        return playerEquipmentComponent
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


}