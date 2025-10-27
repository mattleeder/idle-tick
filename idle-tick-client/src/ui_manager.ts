import { ScreenPosition } from "./position"
import { isNumberSize, isResolution, type IInteractiveUiElement } from "./ui/interactive_element"
import { UiGroup } from "./ui/ui_group"

export class UiManager {
    private baseWidth: number
    private baseHeight: number
    private _currentWidth: number
    private _currentHeight: number
    private currentScale: number
    private currentScaleX: number
    private currentScaleY: number

    children: IInteractiveUiElement[]

    constructor(baseWidth: number, baseHeight: number) {
        this.baseWidth = baseWidth
        this.baseHeight = baseHeight
        
        this._currentWidth = baseWidth
        this._currentHeight = baseHeight

        this.currentScale = 1
        this.currentScaleX = 1
        this.currentScaleY = 1

        this.children = []
    }

    get currentWidth() {
        return this._currentWidth
    }

    get currentHeight() {
        return this._currentHeight
    }

    set currentWidth(newWidth: number) {
        if (this.currentWidth == newWidth) {
            return
        }
        this._currentWidth = newWidth
        this.resize(newWidth, this.currentHeight)
    }

    set currentHeight(newHeight: number) {
        if (this.currentHeight == newHeight) {
            return
        }
        this._currentHeight = newHeight
        this.resize(this.currentWidth, newHeight)
    }

    addUiElement(uiElement: IInteractiveUiElement) {
        this.children.push(uiElement)
    }

    resize(newWidth: number, newHeight: number) {
        const scaleX = newWidth / this.baseWidth
        const scaleY = newHeight / this.baseHeight
        const scale = Math.min(scaleX, scaleY)

        const deltaX = scaleX / this.currentScaleX
        const deltaY = scaleY / this.currentScaleY

        this.currentScaleX = scaleX
        this.currentScaleY = scaleY

        // console.log(`this.baseWidth: ${this.baseWidth}, this.baseHeight: ${this.baseHeight}, newWidth: ${newWidth}, newHeight: ${newHeight}`)
        console.log(`this.currentScale: ${this.currentScale}, newScale: ${scale}`)

        const delta = scale / this.currentScale
        console.log(`delta: ${delta}`)
        this.currentScale = scale
        for (const child of this.children) {
            console.log(child.debugInfo.name)
            child.elementPosition = new ScreenPosition(child.elementPosition.x * deltaX, child.elementPosition.y * deltaY)
            if(isResolution(child.elementSize)) {
                child.elementSize = {width: child.elementSize.width * deltaX, height: child.elementSize.height * deltaY}
            } else if (isNumberSize(child.elementSize)) {
                child.elementSize = child.elementSize * delta
            }

            if (child instanceof UiGroup) {
                child.scaleChildren(deltaX, deltaY, delta)
                continue
            }
            this.recursiveScale(child, deltaX, deltaY, delta)
        }
    }

    recursiveScale(element: IInteractiveUiElement, deltaX: number, deltaY: number, delta: number) {
        if (!Object.hasOwn(element, "children")) {
            return
        }
        for (const child of element.children) {
            // child.elementPosition = new ScreenPosition(child.elementPosition.x * deltaX, child.elementPosition.y * deltaY)
            if(isResolution(child.elementSize)) {
                child.elementSize = {width: child.elementSize.width * deltaX, height: child.elementSize.height * deltaY}
            } else if (isNumberSize(child.elementSize)) {
                child.elementSize = child.elementSize * delta
            }

            if (child instanceof UiGroup) {
                child.scaleChildren(deltaX, deltaY, delta)
                continue
            }

            this.recursiveScale(child, deltaX, deltaY, delta)
        }

    }

    draw(ctx: CanvasRenderingContext2D) {
        for (const element of this.children) {
            element.draw(ctx)
        }
    }

}