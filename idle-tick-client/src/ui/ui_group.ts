import type { ScreenPosition } from "../position";
import type { InteractiveElementDebugInfo, IInteractiveUiElement } from "./interactive_element";
import { SquareUiElement } from "./square_ui_element";

export class UiGroup extends SquareUiElement {
    constructor(
        isActive: boolean,
        isClickable: boolean,
        elementPosition: ScreenPosition,
        debugInfo: InteractiveElementDebugInfo,
        children: IInteractiveUiElement[] = [],
    ) {
        const elementSize = {width: 0, height: 0}
        super(isActive, isClickable, elementPosition, elementSize, debugInfo, children)
    }

    get elementPosition() {
        return super.elementPosition
    }

    set elementPosition(newScreenPosition: ScreenPosition) {
        const difference = newScreenPosition.sub(this.elementPosition)
        super.elementPosition = newScreenPosition
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
        const childCurrentPosition = child.elementPosition
        const childOffsetPosition = this.elementPosition.add(childCurrentPosition)
        child.elementPosition = childOffsetPosition
    }
}