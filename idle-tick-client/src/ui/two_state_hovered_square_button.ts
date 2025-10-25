import type { Resolution } from "../camera"
import type { ScreenPosition } from "../position"
import type { InteractiveElementDebugInfo, IInteractiveUiElement } from "./interactive_element"
import { SquareUiElement } from "./square_ui_element"

export class TwoStateHoveredSquareButton extends SquareUiElement {
    // A button that is either clicked or not clicked
    protected _unHoveredIcon: HTMLImageElement | undefined
    protected _hoveredIcon: HTMLImageElement | undefined
    protected _unHoveredBackground: HTMLImageElement | undefined
    protected _hoveredBackground: HTMLImageElement | undefined

    constructor(
        isActive: boolean,
        elementPosition: ScreenPosition,
        elementSize: Resolution,
        unHoveredIcon: HTMLImageElement | undefined,
        hoveredIcon: HTMLImageElement | undefined,
        unHoveredBackground: HTMLImageElement | undefined,
        hoveredBackground: HTMLImageElement | undefined,
        debugInfo: InteractiveElementDebugInfo,
    ) {
        const isClickable = true
        const children: IInteractiveUiElement[] = []
        super(isActive, isClickable, elementPosition, elementSize, debugInfo, children)
        
        this._unHoveredIcon = unHoveredIcon
        this._hoveredIcon = hoveredIcon
        this._unHoveredBackground = unHoveredBackground
        this._hoveredBackground = hoveredBackground
        
        this.setActiveIcon(this.unHoveredIcon)
        this.setActiveBackground(this.unHoveredBackground)

        this.onMouseEnter(() => {
            this.setActiveBackground(this.hoveredBackground)
            this.setActiveIcon(this.hoveredIcon)
        })

        this.onMouseLeave(() => {
            this.setActiveBackground(this.unHoveredBackground)
            this.setActiveIcon(this.unHoveredIcon)
        })
    }

    get unHoveredIcon() {
        return this._unHoveredIcon
    }

    get hoveredIcon() {
        return this._hoveredIcon
    }

    get unHoveredBackground() {
        return this._unHoveredBackground
    }

    get hoveredBackground() {
        return this._hoveredBackground
    }

    set unHoveredIcon(newUnclickedIcon: HTMLImageElement | undefined) {
        this._unHoveredIcon = newUnclickedIcon
        if (!this.isHovered) {
            this.setActiveIcon(this.unHoveredIcon)
        }
    }

    set hoveredIcon(newClickedIcon: HTMLImageElement | undefined) {
        this._hoveredIcon = newClickedIcon
        if (this.isHovered) {
            this.setActiveIcon(this.hoveredIcon)
        }
    }

    set unHoveredBackground(newUnclickedBackground: HTMLImageElement | undefined) {
        this._unHoveredBackground = newUnclickedBackground
        if (!this.isHovered) {
            this.setActiveBackground(this.unHoveredBackground)
        }
    }

    set clickedBackground(newClickedBackground: HTMLImageElement | undefined) {
        this._hoveredBackground = newClickedBackground
        if (this.isHovered) {
            this.setActiveBackground(this.hoveredBackground)
        }
    }

}