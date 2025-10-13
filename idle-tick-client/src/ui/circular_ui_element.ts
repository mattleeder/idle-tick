import type { ScreenPosition } from "../position"
import { InteractiveElement, type IInteractiveUiElement, type InteractiveElementDebugInfo, type InteractiveUiElementStateImages } from "./interactive_element"

export class CircularUIElement extends InteractiveElement<number> {

    protected activeBackground: HTMLImageElement | undefined
    protected backgroundRecord: InteractiveUiElementStateImages

    protected activeIcon: HTMLImageElement | undefined
    protected iconRecord: InteractiveUiElementStateImages

    protected radius: number

    constructor(
        isActive: boolean,
        isClickable: boolean,
        elementPosition: ScreenPosition,
        radius: number,
        iconRecord: InteractiveUiElementStateImages,
        backgroundRecord: InteractiveUiElementStateImages,
        debugInfo: InteractiveElementDebugInfo,
        children: IInteractiveUiElement[] = []
    ) {
        super(isActive, isClickable, elementPosition, radius, debugInfo, children)
        this.radius = radius
        this.iconRecord = iconRecord
        this.backgroundRecord = backgroundRecord

        this.onMouseEnter(() => this.setActiveIcon(this.iconRecord["hovered"]))
        this.onMouseEnter(() => this.setActiveBackground(this.backgroundRecord["hovered"]))

        this.onMouseLeave(() => this.setActiveIcon(this.iconRecord["default"]))
        this.onMouseLeave(() => this.setActiveBackground(this.backgroundRecord["default"]))

        this.onMouseDown(() => this.setActiveIcon(this.iconRecord["down"]))
        this.onMouseDown(() => this.setActiveBackground(this.backgroundRecord["down"]))

        this.onMouseClick(() => this.setActiveIcon(this.iconRecord["clicked"]))
        this.onMouseClick(() => this.setActiveBackground(this.backgroundRecord["clicked"]))
    }

    setActiveBackground(newBackground: HTMLImageElement | undefined) {
        this.activeBackground = newBackground
    }

    setActiveIcon(newIcon: HTMLImageElement | undefined) {
        this.activeIcon = newIcon    
    }

    mouseWithinBoundary(mousePositionX: number, mousePositionY: number): boolean {
        if (((mousePositionX - this.radius) ** 2 + (mousePositionY - this.radius) ** 2) < this.radius ** 2) {
            return true
        }
        return false
    }

    draw(ctx: CanvasRenderingContext2D) {
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
    }

}