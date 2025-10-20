import type { Resolution } from "../camera";
import type { EquipmentSlotKeys } from "../ecs_types";
import { INVENTORY_BUTTON_FLASH_DURATION_MS } from "../globals";
import type { ScreenPosition } from "../position";
import type { InteractiveElementDebugInfo } from "./interactive_element";
import { ClickStates, TwoStateSquareButton } from "./two_state_square_button";

export interface EquipmentButtonData {
    slotType: EquipmentSlotKeys
}

export class EquipmentButton extends TwoStateSquareButton {
    protected equipmentButtonData: EquipmentButtonData

    constructor(
        isActive: boolean,
        elementPosition: ScreenPosition,
        elementSize: Resolution,
        icon: HTMLImageElement,
        equipmentButtonData: EquipmentButtonData,
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

        this.onMouseClick(() => {
            if (this.clickState == ClickStates.UnClicked) {
                console.log(`clicked on slot ${this.equipmentButtonData.slotType}`)
                this.clickState = ClickStates.Clicked
                setTimeout(() => this.clickState = ClickStates.UnClicked, INVENTORY_BUTTON_FLASH_DURATION_MS)
            }
        })
    }
}