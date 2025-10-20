import type { ScreenPosition } from "../position";
import type { UiEngineCommunicator } from "../ui_engine_communicator";
import { CircularUIElement } from "./circular_ui_element";
import type { InteractiveElementDebugInfo } from "./interactive_element";

export class CompassButton extends CircularUIElement {
    protected uiEngineCommunicator: UiEngineCommunicator

    constructor(
        isActive: boolean,
        elementPosition: ScreenPosition,
        radius: number,
        icon: HTMLImageElement,
        uiEngineCommunicator: UiEngineCommunicator,
        debugInfo: InteractiveElementDebugInfo,
    ) {
        const isClickable = true
        super(isActive, isClickable, elementPosition, radius, debugInfo)
        this.uiEngineCommunicator = uiEngineCommunicator
        this.setActiveIcon(icon)

        this.onMouseClick(() => {
            console.log(`clicked ${debugInfo.name}`)
            this.uiEngineCommunicator.setCameraRotationAngle(0)
        })
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isActive) {
            return
        }

        const compassCentreScreenPosition = this.elementPosition
        ctx.save()

        ctx.beginPath()
        ctx.arc(compassCentreScreenPosition.x, compassCentreScreenPosition.y, this.uiEngineCommunicator.getCameraBaseTileSize() / 2, 0, 2 * Math.PI)
        ctx.clip()

        ctx.translate(compassCentreScreenPosition.x, compassCentreScreenPosition.y)
        ctx.rotate(this.uiEngineCommunicator.getCameraRotationAngle())
        ctx.translate(-compassCentreScreenPosition.x, -compassCentreScreenPosition.y)

        super.draw(ctx)

        ctx.restore()
    }
}