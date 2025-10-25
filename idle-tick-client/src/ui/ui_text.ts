import type { Resolution } from "../camera"
import type { ScreenPosition } from "../position"
import { InteractiveElement, type IInteractiveUiElement, type InteractiveElementDebugInfo } from "./interactive_element"

export class UiText extends InteractiveElement<Resolution> {
    private _textContent: string

    constructor(textContent: string, isActive: boolean, isClickable: boolean, elementPosition: ScreenPosition, elementSize: Resolution, debugInfo: InteractiveElementDebugInfo) {
        const children: IInteractiveUiElement[] = []
        super(isActive, isClickable, elementPosition, elementSize, debugInfo, children)
        this._textContent = textContent
    }

    get textContent() {
        return this._textContent
    }

    set textContent(newText: string) {
        this._textContent = newText
    }

    mouseWithinBoundary(mousePositionX: number, mousePositionY: number): boolean {
        return false
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isActive) {
            return
        }
        ctx.save()

        ctx.strokeText(this.textContent, this.elementPosition.x, this.elementPosition.y)

        ctx.restore()
    }
}