import type { Resolution } from "../camera";
import type { ScreenPosition } from "../position";
import type { ControlledUiElement } from "./controlled_ui_element";
import type { InteractiveUiElementStateKeys, InteractiveElementDebugInfo, IInteractiveUiElement } from "./interactive_element";
import { SquareUiElement } from "./square_ui_element";

export class RibbonButton extends SquareUiElement {
    private ribbonMenuController: ControlledUiElement
    childElement: IInteractiveUiElement

    constructor(
        isActive: boolean,
        isClickable: boolean,
        elementPosition: ScreenPosition,
        elementSize: Resolution,
        iconRecord: Record<InteractiveUiElementStateKeys, HTMLImageElement | undefined>,
        backgroundRecord: Record<InteractiveUiElementStateKeys, HTMLImageElement | undefined>,
        ribbonMenuController: ControlledUiElement,
        debugInfo: InteractiveElementDebugInfo,
        childElement: IInteractiveUiElement,
    ) {
        super(isActive, isClickable, elementPosition, elementSize, iconRecord, backgroundRecord, debugInfo, [childElement])
        this.ribbonMenuController = ribbonMenuController
        this.childElement = childElement
        this.onMouseClick(() => this.ribbonMenuController.activeElement = this.childElement)
    }
}