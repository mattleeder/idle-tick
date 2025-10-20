import type { Resolution } from "../camera";
import type { PrayerKeys } from "../ecs_types";
import { INVENTORY_BUTTON_FLASH_DURATION_MS } from "../globals";
import type { ScreenPosition } from "../position";
import type { UiEngineCommunicator } from "../ui_engine_communicator";
import type { InteractiveElementDebugInfo } from "./interactive_element";
import { ClickStates, TwoStateSquareButton } from "./two_state_square_button";

export interface PrayerButtonData {
    prayerType: PrayerKeys
}

export class PrayerButton extends TwoStateSquareButton {
    protected prayerButtonData: PrayerButtonData
    protected uiEngineCommunicator: UiEngineCommunicator

    constructor(
        isActive: boolean,
        elementPosition: ScreenPosition,
        elementSize: Resolution,
        icon: HTMLImageElement,
        prayerButtonData: PrayerButtonData,
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

        this.uiEngineCommunicator = uiEngineCommunicator

        this.prayerButtonData = prayerButtonData

        this.onMouseClick(() => {
            if (this.clickState == ClickStates.UnClicked) {
                console.log(`clicked on slot ${this.prayerButtonData.prayerType}`)
                this.clickState = ClickStates.Clicked
                setTimeout(() => this.clickState = ClickStates.UnClicked, INVENTORY_BUTTON_FLASH_DURATION_MS)
                uiEngineCommunicator.queuePrayerChange({prayer: this.prayerButtonData.prayerType})
            }
        })
    }
}