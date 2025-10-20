import type { Resolution } from "../camera"
import { ScreenPosition } from "../position"
import { InteractiveElement, type IInteractiveUiElement, type InteractiveElementDebugInfo } from "./interactive_element"

export class SquareUiElement extends InteractiveElement<Resolution> {

    protected activeBackground: HTMLImageElement | undefined
    protected activeIcon: HTMLImageElement | undefined

    constructor(
        isActive: boolean,
        isClickable: boolean,
        elementPosition: ScreenPosition,
        elementSize: Resolution,
        debugInfo: InteractiveElementDebugInfo,
        children: IInteractiveUiElement[] = []
    ) {
        super(isActive, isClickable, elementPosition, elementSize, debugInfo, children)
    }

    setActiveBackground(newBackground: HTMLImageElement | undefined) {
        this.activeBackground = newBackground
    }

    setActiveIcon(newIcon: HTMLImageElement | undefined) {
        this.activeIcon = newIcon    
    }
    
    mouseWithinBoundary(mousePositionX: number, mousePositionY: number): boolean {
        // console.log(`Check boundary, mouse: ${mousePositionX},${mousePositionY}, element: ${this.elementPosition.x},${this.elementPosition.y}`)
        if (!(this.isActive)) {
            return false
        }

        if (mousePositionX < this.elementPosition.x || mousePositionX > this.elementPosition.x + this.elementSize.width) {
            return false
        }

        if (mousePositionY < this.elementPosition.y || mousePositionY > this.elementPosition.y + this.elementSize.height) {
            return false
        }


        return true
    }

    draw(ctx: CanvasRenderingContext2D){
        if (!this.isActive) {
            return
        }
        
        ctx.save()

        // ctx.strokeStyle = "#000000"
        // ctx.strokeRect(this.elementPosition.x, this.elementPosition.y, this.elementSize.width,  this.elementSize.height)

        if (this.activeBackground !== undefined) {
            ctx.drawImage(
                this.activeBackground,
                this.elementPosition.x,
                this.elementPosition.y,
                this.elementSize.width,
                this.elementSize.height
            )
        }

        if (this.activeIcon !== undefined) {
            ctx.drawImage(
                this.activeIcon,
                this.elementPosition.x,
                this.elementPosition.y,
                this.elementSize.width,
                this.elementSize.height
            )
        }

        for(const child of this.children) {
            child.draw(ctx)
        }

        ctx.restore()
    }
}