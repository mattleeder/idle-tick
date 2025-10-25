import type { Resolution } from "../camera";
import { type Entity } from "../ecs_types";
import { INVENTORY_BUTTON_FLASH_DURATION_MS, type ItemKeys } from "../globals";
import { getItemModel } from "../item_models";
import { clickOnItem } from "../item_options";
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
    protected itemKey: ItemKeys | null

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
        this.itemKey = null

        this.uiEngineCommunicator.onPlayerInventoryChange(() => {
            const newItemEntity = this.uiEngineCommunicator.playerCurrentInventory[this.inventoryButtonData.slotNumber]
            if (newItemEntity == this.itemEntity) {
                return
            }
            this.itemEntity = newItemEntity
            if (newItemEntity === null) {
                const transparentBackground = new Image()
                transparentBackground.src = "src/assets/transparent_background.png"
                this.unClickedIcon = transparentBackground
                return
            }

            const newItemDetails = this.uiEngineCommunicator.getItemDetails(newItemEntity)
            console.log(newItemDetails)
            const newIcon = new Image()
            newIcon.src = getItemModel(newItemDetails.itemKey)
            this.unClickedIcon = newIcon
        })

        this.onMouseClick(() => {
            if (this.clickState == ClickStates.UnClicked) {
                console.log(`clicked on slot ${this.inventoryButtonData.slotNumber} which hold ${this.itemKey} with entity: ${this.itemEntity}`)
                this.clickState = ClickStates.Clicked
                setTimeout(() => this.clickState = ClickStates.UnClicked, INVENTORY_BUTTON_FLASH_DURATION_MS)

                if (this.itemEntity === null) {
                    return
                }

                const clickOption = 0
                clickOnItem(uiEngineCommunicator, this.itemEntity, this.inventoryButtonData.slotNumber, clickOption)
            }
        })
    }
}

// Add listeners for on inventory change and such to this and playerDataGrabber