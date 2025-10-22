import type { Resolution } from "../camera";
import { InventoryUseType, type Entity } from "../ecs_types";
import { INVENTORY_BUTTON_FLASH_DURATION_MS } from "../globals";
import type { ScreenPosition } from "../position";
import type { UiEngineCommunicator } from "../ui_engine_communicator";
import type { InteractiveElementDebugInfo } from "./interactive_element";
import { ClickStates, TwoStateSquareButton } from "./two_state_square_button";

interface InventoryButtonData {
    slotNumber: number
}

export class InventoryButton extends TwoStateSquareButton {
    protected inventoryButtonData: InventoryButtonData
    protected uiEngineCommunicator: UiEngineCommunicator
    protected itemEntity: Entity | null

    constructor(
        isActive: boolean,
        elementPosition: ScreenPosition,
        elementSize: Resolution,
        icon: HTMLImageElement,
        inventoryButtonData: InventoryButtonData,
        uiEngineCommunicator: UiEngineCommunicator,
        debugInfo: InteractiveElementDebugInfo,
    ) {
        const clickedIcon = undefined 
        const background = undefined
        super(isActive,
            elementPosition,
            elementSize,
            icon,
            clickedIcon,                                                                                                                                                                                                 
            background,
            background,
            debugInfo,
        )

        this.inventoryButtonData = inventoryButtonData
        this.uiEngineCommunicator = uiEngineCommunicator
        this.itemEntity = null

        this.uiEngineCommunicator.onPlayerInventoryChange(() => {
            const newItemEntity = this.uiEngineCommunicator.playerCurrentInventory[this.inventoryButtonData.slotNumber]
            if (newItemEntity == this.itemEntity) {
                return
            }
            this.itemEntity = newItemEntity
            if (newItemEntity === null) {
                const emptyEquipSlot = new Image()
                emptyEquipSlot.src = "src/assets/empty_equip_slot.png"
                this.unClickedIcon = emptyEquipSlot
                return
            }

            const newItemDetails = this.uiEngineCommunicator.getItemDetails(newItemEntity)
            const newIcon = new Image()
            newIcon.src = newItemDetails.icon
            this.unClickedIcon = newIcon
        })

        this.onMouseClick(() => {
            if (this.clickState == ClickStates.UnClicked) {
                console.log(`clicked on slot ${this.inventoryButtonData.slotNumber} which hold entity: ${this.itemEntity}`)
                this.clickState = ClickStates.Clicked
                setTimeout(() => this.clickState = ClickStates.UnClicked, INVENTORY_BUTTON_FLASH_DURATION_MS)

                if (this.itemEntity === null) {
                    return
                }

                const itemDetails = this.uiEngineCommunicator.getItemDetails(this.itemEntity)

                switch(itemDetails.itemType) {
                    case InventoryUseType.Equip:
                        this.uiEngineCommunicator.queueEquipmentChange(this.itemEntity, this.inventoryButtonData.slotNumber)
                        break;
                    default:
                        return
                }
            }
        })
    }
}

// Add listeners for on inventory change and such to this and playerDataGrabber