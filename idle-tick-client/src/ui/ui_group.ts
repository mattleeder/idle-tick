import type { ProcessedInput } from "../combat_engine";
import { ScreenPosition } from "../position";
import { type InteractiveElementDebugInfo, type IInteractiveUiElement, isNumberSize, isResolution } from "./interactive_element";
import { SquareUiElement } from "./square_ui_element";

// @TODO: this should become anchor point, anchors can be set to top right, top left, bottom right, bottom left
// no other ui class should have children, children should refer to elements whose position and size are shared/controlled by an anchor point

export class UiGroup extends SquareUiElement {

    children: IInteractiveUiElement[]

    constructor(
        isActive: boolean,
        isClickable: boolean,
        elementPosition: ScreenPosition,
        debugInfo: InteractiveElementDebugInfo,
        children: IInteractiveUiElement[] = [],
    ) {
        const dummyElementSize = {width: 0, height: 0}
        super(isActive, isClickable, elementPosition, dummyElementSize, debugInfo)
        
        this.children = children
    }

    resize(deltaX: number, deltaY: number, delta: number, preserveAspectRatio: boolean = true) {
        let scaleX = delta
        let scaleY = delta

        if (!preserveAspectRatio) {
            scaleX = deltaX
            scaleY = deltaY
        }
        
        for (const child of this.children) {
            // Adjust positions
            const childMinusParent = child.elementPosition.sub(this.elementPosition)
            const change = new ScreenPosition(childMinusParent.x * scaleX, childMinusParent.y * scaleY)
            child.elementPosition = this.elementPosition.add(change)

            // Recurse to groups
            if (child instanceof UiGroup) {
                child.resize(deltaX, deltaY, delta, true)
            }
            // Adjust size
            else if(isResolution(child.elementSize)) {
                child.elementSize = {width: child.elementSize.width * scaleX, height: child.elementSize.height * scaleY}
            } else if (isNumberSize(child.elementSize)) {
                child.elementSize = child.elementSize * delta
            }
        }
    }

    get elementPosition() {
        return super.elementPosition
    }

    set elementPosition(newScreenPosition: ScreenPosition) {
        if (newScreenPosition == this.elementPosition) {
            return
        }
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
        for (const element of this.children) {
            if (child === element) {
                console.warn(`${child.debugInfo?.name} already exists in ${this.debugInfo.name}`)
                return
            }
        }
        this.children.push(child)
        const childCurrentPosition = child.elementPosition
        const childOffsetPosition = this.elementPosition.add(childCurrentPosition)
        child.elementPosition = childOffsetPosition
    }

    handleMouseInput(processedInput: ProcessedInput) {
        for (const child of this.children) {
            child.handleMouseInput(processedInput)
            this.shouldHaltInteraction = this.shouldHaltInteraction || child.shouldHaltInteraction
            child.shouldHaltInteraction = false
        }
        return this.shouldHaltInteraction
    }

    draw(ctx: CanvasRenderingContext2D): void {
        for (const child of this.children) {
            if (child.isActive) {
                child.draw(ctx)
            }
        }
    }
}