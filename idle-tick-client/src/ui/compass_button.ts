import type { ScreenPosition } from "../position";
import { CircularUIElement } from "./circular_ui_element";
import type { InteractiveUiElementStateKeys, InteractiveElementDebugInfo, IInteractiveUiElement } from "./interactive_element";

export class CompassButton extends CircularUIElement {
    constructor(
        isActive: boolean,
        isClickable: boolean,
        elementPosition: ScreenPosition,
        radius: number,
        iconRecord: Record<InteractiveUiElementStateKeys, HTMLImageElement | undefined>,
        backgroundRecord: Record<InteractiveUiElementStateKeys, HTMLImageElement | undefined>,
        debugInfo: InteractiveElementDebugInfo,
        children: IInteractiveUiElement[] = []
    ) {
        super(isActive, isClickable, elementPosition, radius, iconRecord, backgroundRecord, debugInfo, children)
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const compassCentreScreenPosition = this.elementPosition
        ctx.save()

        ctx.beginPath()
        ctx.arc(compassCentreScreenPosition.x, compassCentreScreenPosition.y, this.camera.baseTileSize / 2, 0, 2 * Math.PI)
        ctx.clip()

        ctx.translate(compassCentreScreenPosition.x, compassCentreScreenPosition.y)
        ctx.rotate(this.camera.rotationAngle)
        ctx.translate(-compassCentreScreenPosition.x, -compassCentreScreenPosition.y)

        super.draw(ctx)

        ctx.restore()
    }
}