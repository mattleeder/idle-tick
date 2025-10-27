import type { ProcessedInput } from "../combat_engine";
import type { ScreenPosition } from "../position";
import { type IInteractiveUiElement, type uiCallbackFn } from "./interactive_element";

// @TODO: revisit this class
// causing issues with double firing events, once here and once on the active element

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

    get elementPosition() {
        return this.activeElement.elementPosition
    }

    set elementPosition(newPosition: ScreenPosition) {
        // this.activeElement.elementPosition = newPosition
    }

    get activeElement() {
        return this._activeElement
    }

    set activeElement(newActiveElement: IInteractiveUiElement) {
        if (newActiveElement === this.activeElement) {
            return
        }

        this.activeElement.isActive = false
        this._activeElement = newActiveElement
        this.activeElement.isActive = true
        
        console.log("Active changed!")
        for (const callbackFn of this.onActiveChangeListeners) {
            callbackFn()
        }
    }

    handleMouseInput(processedInput: ProcessedInput): void {
        // this.activeElement.handleMouseInput(processedInput)
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // this.activeElement.draw(ctx)
    }

    onActiveChange(callbackFn: uiCallbackFn) {
        this.onActiveChangeListeners.push(callbackFn)
    }
}