import type { ScreenPosition } from "../position"
import { InteractiveElement, type IInteractiveUiElement, type InteractiveElementDebugInfo, type InteractiveUiElementStateImages } from "./interactive_element"

export class CircularUIElement extends InteractiveElement<number> {

    protected activeBackground: HTMLImageElement | undefined
    protected activeIcon: HTMLImageElement | undefined

    protected radius: number

    constructor(
        isActive: boolean,
        isClickable: boolean,
        elementPosition: ScreenPosition,
        radius: number,
        debugInfo: InteractiveElementDebugInfo,
        children: IInteractiveUiElement[] = []
    ) {
        super(isActive, isClickable, elementPosition, radius, debugInfo, children)
        this.radius = radius
    }

    setActiveBackground(newBackground: HTMLImageElement | undefined) {
        this.activeBackground = newBackground
    }

    setActiveIcon(newIcon: HTMLImageElement | undefined) {
        this.activeIcon = newIcon    
    }

    mouseWithinBoundary(mousePositionX: number, mousePositionY: number): boolean {
        if (((mousePositionX - this.elementPosition.x) ** 2 + (mousePositionY - this.elementPosition.y) ** 2) < this.radius ** 2) {
            return true
        }
        return false
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.isActive) {
            return
        }

        ctx.save()

        ctx.strokeStyle = "#000000"
        ctx.beginPath()
        ctx.arc(this.elementPosition.x, this.elementPosition.y, this.radius, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.clip()

        if (this.activeBackground !== undefined) {
            ctx.drawImage(
                this.activeBackground,
                this.elementPosition.x - this.radius,
                this.elementPosition.y - this.radius,
                this.radius * 2,
                this.radius * 2,
            )
        }

        if (this.activeIcon !== undefined) {
            ctx.drawImage(
                this.activeIcon,
                this.elementPosition.x - this.radius,
                this.elementPosition.y - this.radius,
                this.radius * 2,
                this.radius * 2,
            )
        }

        ctx.restore()
    }

}