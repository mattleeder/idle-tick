import { ScreenPosition } from "./position"
import { type IInteractiveUiElement } from "./ui/interactive_element"
import { UiGroup } from "./ui/ui_group"

export class UiManager {
    private baseWidth: number
    private baseHeight: number
    private _currentWidth: number
    private _currentHeight: number
    private currentScale: number
    private currentScaleX: number
    private currentScaleY: number

    baseUiGroup: UiGroup

    constructor(baseWidth: number, baseHeight: number) {
        this.baseWidth = baseWidth
        this.baseHeight = baseHeight
        
        this._currentWidth = baseWidth
        this._currentHeight = baseHeight

        this.currentScale = 1
        this.currentScaleX = 1
        this.currentScaleY = 1

        this.baseUiGroup = new UiGroup(
            true,
            false,
            new ScreenPosition(0, 0),
            {name: "baseUiGruop"}
        )
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
        this.baseUiGroup.addChild(uiElement)
    }

    resize(newWidth: number, newHeight: number) {
        const scaleX = newWidth / this.baseWidth
        const scaleY = newHeight / this.baseHeight
        const scale = Math.min(scaleX, scaleY)

        const deltaX = scaleX / this.currentScaleX
        const deltaY = scaleY / this.currentScaleY
        const delta = scale / this.currentScale

        this.currentScaleX = scaleX
        this.currentScaleY = scaleY
        this.currentScale = scale

        console.log(`this.currentScale: ${this.currentScale}, newScale: ${scale}`)
        console.log(`deltaX: ${deltaX}, deltaY: ${deltaY}, delta: ${delta}`)

        this.baseUiGroup.resize(deltaX, deltaY, delta, false)
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.baseUiGroup.draw(ctx)
    }

}