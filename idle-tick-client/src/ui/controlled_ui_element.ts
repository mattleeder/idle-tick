import type { ProcessedInput } from "../combat_engine";
import { type IInteractiveUiElement, type uiCallbackFn } from "./interactive_element";

export class ControlledUiElement implements IInteractiveUiElement {
    protected _activeElement: IInteractiveUiElement
    protected onActiveChangeListeners: uiCallbackFn[]

    constructor(activeElement: IInteractiveUiElement) {
        this._activeElement = activeElement
        this.onActiveChangeListeners = []
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
        if (newActiveElement === this.activeElement) {
            return
        }

        this.activeElement.isActive = false
        this.activeElement = newActiveElement
        this.activeElement.isActive = true
        
        for (const callbackFn of this.onActiveChangeListeners) {
            callbackFn()
        }
    }

    handleMouseInput(processedInput: ProcessedInput): void {
        this.activeElement.handleMouseInput(processedInput)
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.activeElement.draw(ctx)
    }

    onActiveChange(callbackFn: uiCallbackFn) {
        this.onActiveChangeListeners.push(callbackFn)
    }
}