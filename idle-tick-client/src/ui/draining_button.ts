import type { ScreenPosition } from "../position";
import { CircularUIElement } from "./circular_ui_element";
import type { InteractiveUiElementStateKeys, InteractiveElementDebugInfo, IInteractiveUiElement } from "./interactive_element";

export class DrainingButton extends CircularUIElement {
    private getStat: () => {numerator: number, denominator: number}

    constructor(
        isActive: boolean,
        isClickable: boolean,
        elementPosition: ScreenPosition,
        radius: number,
        iconRecord: Record<InteractiveUiElementStateKeys, HTMLImageElement | undefined>,
        backgroundRecord: Record<InteractiveUiElementStateKeys, HTMLImageElement | undefined>,
        debugInfo: InteractiveElementDebugInfo,
        getStat: () => {numerator: number, denominator: number},
        children: IInteractiveUiElement[] = []
    ) {
        super(isActive, isClickable, elementPosition, radius, iconRecord, backgroundRecord, debugInfo, children)
        this.getStat = getStat
    }
    
    draw(ctx: CanvasRenderingContext2D): void {

        const data = this.getStat()
        const percentage = data.denominator != 0 ? data.numerator / data.denominator : 0

        if (this.activeBackground === undefined) {
            throw new Error("buttonBackground is undefined")
        }

        if (this.activeIcon === undefined) {
            throw new Error("buttonIcon is undefined")
        }

        ctx.save()

        ctx.beginPath()
        ctx.arc(this.elementPosition.x, this.elementPosition.y, this.elementSize, 0, 2 * Math.PI)
        ctx.clip()

        ctx.drawImage(
            this.activeBackground,
            this.elementPosition.x - this.radius,
            this.elementPosition.y - this.radius,
            this.elementSize * 2,
            this.elementSize * 2,
        )

        ctx.fillRect(
            this.elementPosition.x - this.radius,
            this.elementPosition.y - this.radius,
            this.elementSize * 2,
            this.elementSize * 2 * (1 - percentage),
        )

        ctx.drawImage(
            this.activeIcon,
            this.elementPosition.x - this.radius,
            this.elementPosition.y - this.radius,
            this.elementSize * 2,
            this.elementSize * 2,
        )

        ctx.restore()
    }
}