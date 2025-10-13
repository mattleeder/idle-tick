import type { Resolution } from "../camera";
import type { ScreenPosition } from "../position";
import type { InteractiveUiElementStateKeys, InteractiveElementDebugInfo, IInteractiveUiElement } from "./interactive_element";
import { SquareUiElement } from "./square_ui_element";

export class UiGroup extends SquareUiElement {
    constructor(
        isActive: boolean,
        isClickable: boolean,
        elementPosition: ScreenPosition,
        elementSize: Resolution,
        iconRecord: Record<InteractiveUiElementStateKeys, HTMLImageElement | undefined>,
        backgroundRecord: Record<InteractiveUiElementStateKeys, HTMLImageElement | undefined>,
        debugInfo: InteractiveElementDebugInfo,
        children: IInteractiveUiElement[] = [],
    ) {
        super(isActive, isClickable, elementPosition, elementSize, iconRecord, backgroundRecord, debugInfo, children)
    }

    get elementPosition() {
        return this.elementPosition
    }

    set elementPosition(newScreenPosition: ScreenPosition) {
        const difference = newScreenPosition.sub(this.elementPosition)
        this.elementPosition = newScreenPosition
        this.offsetChildPositions(difference)
        
    }

    offsetChildPositions(offset: ScreenPosition): void {
        for (const child of this.children) {
            const childCurrentPosition = child.elementPosition
            const childOffsetPosition = offset.add(childCurrentPosition)
            child.elementPosition = childOffsetPosition
        }
    }

    addChild(child: IInteractiveUiElement) {
        this.children.push(child)
    }
}