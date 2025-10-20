import type { Resolution } from "../camera";
import { INVENTORY_BUTTON_FLASH_DURATION_MS } from "../globals";
import type { ScreenPosition } from "../position";
import type { InteractiveElementDebugInfo } from "./interactive_element";
import { ClickStates, TwoStateSquareButton } from "./two_state_square_button";

interface InventoryButtonData {
    slotNumber: number
}

export class InventoryButton extends TwoStateSquareButton {
    protected inventoryButtonData: InventoryButtonData

    constructor(
        isActive: boolean,
        elementPosition: ScreenPosition,
        elementSize: Resolution,
        icon: HTMLImageElement,
        inventoryButtonData: InventoryButtonData,
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

        this.onMouseClick(() => {
            if (this.clickState == ClickStates.UnClicked) {
                console.log(`clicked on slot ${this.inventoryButtonData.slotNumber}`)
                this.clickState = ClickStates.Clicked
                setTimeout(() => this.clickState = ClickStates.UnClicked, INVENTORY_BUTTON_FLASH_DURATION_MS)
            }
        })
    }
}