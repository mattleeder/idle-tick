import type { ProcessedInput } from "../combat_engine"
import { ScreenPosition } from "../position"

export type uiCallbackFn = () => void

export const InteractiveUiElementStates = {
    default:    "default",
    hovered:    "hovered",
    clicked:    "clicked",
    down:       "down",
}

export type InteractiveUiElementStateKeys = typeof InteractiveUiElementStates[keyof typeof InteractiveUiElementStates]

export interface  IInteractiveUiElement {
    isActive: boolean
    elementPosition: ScreenPosition
    shouldHaltInteraction: boolean
    handleMouseInput(processedInput: ProcessedInput): void
    draw(ctx: CanvasRenderingContext2D): void
}

export const dummyInteractiveUiElement: IInteractiveUiElement = {
    isActive: false,
    elementPosition: new ScreenPosition(-1, -1),
    handleMouseInput: (processedInput) => {
        return
    },
    draw: (ctx) => {
        return
    },
}

export interface InteractiveElementDebugInfo {
    name: string
}

export type InteractiveUiElementStateImages = Record<InteractiveUiElementStateKeys, HTMLImageElement | undefined>

export abstract class InteractiveElement<T> implements IInteractiveUiElement {

    elementSize: T

    debugInfo: InteractiveElementDebugInfo

    private _isActive: boolean
    private _isClickable: boolean
    private _isHovered: boolean
    private _isDown: boolean
    private _isClicked: boolean
    private _elementPosition: ScreenPosition
    private _shouldHaltInteraction: boolean

    private onActiveListeners: uiCallbackFn[]
    private onMouseDownListeners: uiCallbackFn[]
    private onMouseEnterListeners: uiCallbackFn[]
    private onMouseLeaveListeners: uiCallbackFn[]
    private onMouseClickListeners: uiCallbackFn[]

    protected children: IInteractiveUiElement[]

    constructor(isActive: boolean, isClickable: boolean, elementPosition: ScreenPosition, elementSize: T, debugInfo: InteractiveElementDebugInfo, children: IInteractiveUiElement[] = []) {
        this._isActive = isActive
        this._isClickable = isClickable
        this._isHovered = false
        this._isDown = false
        this._isClicked = false
        this._shouldHaltInteraction = false

        this._elementPosition = elementPosition
        this.elementSize = elementSize

        this.children = children

        this.debugInfo = debugInfo

        // Listenders
        this.onActiveListeners = []
        this.onMouseDownListeners = []
        this.onMouseEnterListeners = []
        this.onMouseLeaveListeners = []
        this.onMouseClickListeners = []

    }

    // Is drawn on screen if true
    set isActive(isActive: boolean) {
        if (isActive == this.isActive) {
            return
        }
        this._isActive = isActive
        if (isActive) {
            for (const callbackFn of this.onActiveListeners) {
                callbackFn()
            }
        }
    }

    set isClickable(isClickable: boolean) {
        this._isClickable = isClickable
    }

    set isHovered(isHovered: boolean) {
        if (this.isHovered == isHovered) {
            return
        }
        this._isHovered = isHovered

        // Mouse Enter
        if (isHovered) {
            for (const callbackFn of this.onMouseEnterListeners) {
                callbackFn()
            }

        // Mouse leave
        } else {
            for (const callbackFn of this.onMouseLeaveListeners) {
                callbackFn()
            }
        }

    }

    set isDown(isDown: boolean) {
        if (this.isDown == isDown) {
            return
        }
        this._isDown = isDown

        if (isDown) {
            for (const callbackFn of this.onMouseDownListeners) {
                callbackFn()
            }
        } else if (this.isHovered) {
            this.isClicked = true
        }
    }

    set isClicked(isClicked: boolean) {
        if (this.isClicked == isClicked) {
            return
        }

        this._isClicked = isClicked
        if (isClicked) {
            for (const callbackFn of this.onMouseClickListeners) {
                callbackFn()
            }
        }
    }

    set shouldHaltInteraction(shouldHalt: boolean) {
        this._shouldHaltInteraction = shouldHalt
    }

    get isActive(): boolean {
        return this._isActive
    }

    get isClickable(): boolean {
        return this._isClickable
    }

    get isHovered(): boolean {
        return this._isHovered
    }

    get isDown(): boolean {
        return this._isDown
    }

    get isClicked(): boolean {
        return this._isClicked
    }

    get elementPosition() {
        return this._elementPosition
    }

    get shouldHaltInteraction() {
        return this._shouldHaltInteraction
    }

    set elementPosition(newPosition: ScreenPosition) {
        this._elementPosition = newPosition
    }

    setElementSize(newSize: T) {
        this.elementSize = newSize
    }

    onActive(callbackFn: uiCallbackFn) {
        this.onActiveListeners.push(callbackFn)
    }

    onMouseClick(callbackFn: uiCallbackFn) {
        this.onMouseClickListeners.push(callbackFn)
    }

    onMouseEnter(callbackFn: uiCallbackFn) {
        this.onMouseEnterListeners.push(callbackFn)
    }

    onMouseDown(callbackFn: uiCallbackFn) {
        this.onMouseDownListeners.push(callbackFn)
    }

    onMouseLeave(callbackFn: uiCallbackFn) {
        this.onMouseLeaveListeners.push(callbackFn)
    }


    handleMouseInput(processedInput: ProcessedInput) {
        // @TODO: do we need to check all ui elements?
        if (!this.isActive) {
            return
        }
        
        if (processedInput.mouseMoved) {
            this.handleMouseMove(processedInput)
        }

        if (processedInput.mouseOnePressed) {
            this.handleMouseOnePress()
        }

        if (processedInput.mouseOneReleased) {
            this.handleMouseOneReleased()
        }

        if (processedInput.mouseOneIsDown) {
            this.handleMouseOneDown()
        }

        for (const child of this.children) {
            child.handleMouseInput(processedInput)
            this.shouldHaltInteraction = this.shouldHaltInteraction || child.shouldHaltInteraction
            child.shouldHaltInteraction = false
        }
    }

    handleMouseMove(processedInput: ProcessedInput) {
        if (this.mouseWithinBoundary(processedInput.mouseXCanvasPosition, processedInput.mouseYCanvasPosition)) {
            this.isHovered = true
        } else {
            this.isHovered = false
        }
    }

    handleMouseOnePress() {
        if (this.isHovered) {
            this.isDown = true
            this.shouldHaltInteraction = true
        }
        return true
    }

    handleMouseOneReleased() {
        if (this.isHovered && this.isDown) {
            // @TODO: this seems kind of troll
            // set isClicked = true will call the callbacks
            // Then set isClicked back to false so that we can click again
            this.isClicked = true
            this.isClicked = false
            this.shouldHaltInteraction = true
        }
        this.isDown = false
    }

    handleMouseOneDown() {

    }

    abstract mouseWithinBoundary(mousePositionX: number, mousePositionY: number): boolean
    abstract draw(ctx: CanvasRenderingContext2D): void

}
