import type { Resolution } from "../camera";
import type { Entity, EquipmentSlotKeys } from "../ecs_types";
import { INVENTORY_BUTTON_FLASH_DURATION_MS } from "../globals";
import { getItemModel } from "../item_models";
import type { ScreenPosition } from "../position";
import type { UiEngineCommunicator } from "../ui_engine_communicator";
import type { InteractiveElementDebugInfo } from "./interactive_element";
import { ClickStates, TwoStateSquareButton } from "./two_state_square_button";

export interface EquipmentButtonData {
    slotType: EquipmentSlotKeys
}

export class EquipmentButton extends TwoStateSquareButton {
    protected equipmentButtonData: EquipmentButtonData
    protected uiEngineCommunicator: UiEngineCommunicator
    protected equipmentEntity: Entity | null

    constructor(
        isActive: boolean,
        elementPosition: ScreenPosition,
        elementSize: Resolution,
        icon: HTMLImageElement,
        equipmentButtonData: EquipmentButtonData,
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

        this.equipmentButtonData = equipmentButtonData
        this.uiEngineCommunicator = uiEngineCommunicator
        this.equipmentEntity = null

        this.uiEngineCommunicator.onPlayerEquipmentChange(() => {
            const newEquipmentEntity = this.uiEngineCommunicator.playerCurrentEquipment[this.equipmentButtonData.slotType]
            if (newEquipmentEntity == this.equipmentEntity) {
                return
            }

            this.equipmentEntity = newEquipmentEntity
            if (newEquipmentEntity === null) {
                const emptyEquipSlot = new Image()
                emptyEquipSlot.src = "src/assets/grey_background_with_black_border.png"
                this.unClickedIcon = emptyEquipSlot
                return
            }

            const newItemDetails = this.uiEngineCommunicator.getItemDetails(newEquipmentEntity)
            const newIcon = new Image()
            newIcon.src = getItemModel(newItemDetails.itemKey)
            console.log(getItemModel(newItemDetails.itemKey))
            this.unClickedIcon = newIcon
        })

        this.onMouseClick(() => {
            if (this.clickState == ClickStates.UnClicked) {
                console.log(`clicked on slot ${this.equipmentButtonData.slotType}`)
                this.clickState = ClickStates.Clicked
                setTimeout(() => this.clickState = ClickStates.UnClicked, INVENTORY_BUTTON_FLASH_DURATION_MS)
                this.uiEngineCommunicator.queueUnequip(this.equipmentButtonData.slotType)
            }
        })
    }
}