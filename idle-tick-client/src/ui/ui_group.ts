import type { ScreenPosition } from "../position";
import { type InteractiveElementDebugInfo, type IInteractiveUiElement, isNumberSize, isResolution } from "./interactive_element";
import { SquareUiElement } from "./square_ui_element";

// @TODO: this should become anchor point, anchors can be set to top right, top left, bottom right, bottom left
// no other ui class should have children, children should refer to elements whose position and size are shared/controlled by an anchor point

export class UiGroup extends SquareUiElement {

    constructor(
        isActive: boolean,
        isClickable: boolean,
        elementPosition: ScreenPosition,
        debugInfo: InteractiveElementDebugInfo,
        children: IInteractiveUiElement[] = [],
    ) {
        const dummyElementSize = {width: 0, height: 0}
        super(isActive, isClickable, elementPosition, dummyElementSize, debugInfo, children)
    }

    get elementPosition() {
        return super.elementPosition
    }

    set elementPosition(newScreenPosition: ScreenPosition) {
        const difference = newScreenPosition.sub(this.elementPosition)
        // console.log(`cur: ${this.elementPosition.x},${this.elementPosition.y}, new: ${newScreenPosition.x},${newScreenPosition.y}, diff: ${difference.x},${difference.y}`)
        super.elementPosition = newScreenPosition
        this.offsetChildPositions(difference)
        
    }


    scale(deltaX: number, deltaY: number, delta: number) {
        this.scaleChildren(deltaX, deltaY, delta)
    }

    scaleChildren(deltaX: number, deltaY: number, delta: number) {
        for (const child of this.children) {
            if(isResolution(child.elementSize)) {
                child.elementSize = {width: child.elementSize.width * deltaX, height: child.elementSize.height * deltaY}
            } else if (isNumberSize(child.elementSize)) {
                child.elementSize = child.elementSize * delta
            }
        }
    }

    offsetChildPositions(offset: ScreenPosition): void {
        // console.log(`child offset: ${offset.x},${offset.y}`)
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