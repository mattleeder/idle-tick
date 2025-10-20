import type { Resolution } from "../camera";
import type { ScreenPosition } from "../position";
import type { ControlledUiElement } from "./controlled_ui_element";
import type { InteractiveElementDebugInfo, IInteractiveUiElement } from "./interactive_element";
import { ClickStates, TwoStateSquareButton } from "./two_state_square_button";

export class RibbonButton extends TwoStateSquareButton {
    private ribbonMenuController: ControlledUiElement
    childElement: IInteractiveUiElement

    constructor(
        isActive: boolean,
        elementPosition: ScreenPosition,
        elementSize: Resolution,
        ribbonMenuController: ControlledUiElement,
        icon: HTMLImageElement,
        unClickedBackground: HTMLImageElement,
        clickedBackground: HTMLImageElement,
        debugInfo: InteractiveElementDebugInfo,
        childElement: IInteractiveUiElement,
    ) {
        const clickedIcon = icon
        const unClickedIcon = icon
        super(isActive, elementPosition, elementSize, unClickedIcon, clickedIcon, unClickedBackground, clickedBackground, debugInfo)
        this.ribbonMenuController = ribbonMenuController
        this.childElement = childElement
        this.onMouseClick(() => this.ribbonMenuController.activeElement = this.childElement)

        this.ribbonMenuController.onActiveChange(() => {
            if (this.childElement !== this.ribbonMenuController.activeElement) {
                this.clickState = ClickStates.UnClicked
            } else {
                this.clickState = ClickStates.Clicked
            }
        })
    }
}