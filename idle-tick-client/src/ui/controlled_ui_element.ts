import type { ProcessedInput } from "../combat_engine";
import { type IInteractiveUiElement } from "./interactive_element";

export class ControlledUiElement implements IInteractiveUiElement {
    protected _activeElement: IInteractiveUiElement

    constructor(activeElement: IInteractiveUiElement) {
        this._activeElement = activeElement
    }

    get isActive() {
        return this.activeElement.isActive
    }

    set isActive(isActive: boolean) {
        this.activeElement.isActive = isActive
    }

    get activeElement() {
        return this._activeElement
    }

    get elementPosition() {
        return this.activeElement.elementPosition
    }

    set activeElement(newActiveElement: IInteractiveUiElement) {
        this.activeElement.isActive = false
        this.activeElement = newActiveElement
        this.activeElement.isActive = true
    }

    handleMouseInput(processedInput: ProcessedInput): void {
        this.activeElement.handleMouseInput(processedInput)
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.activeElement.draw(ctx)
    }
}