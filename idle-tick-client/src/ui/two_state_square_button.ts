import type { Resolution } from "../camera"
import type { ScreenPosition } from "../position"
import type { InteractiveElementDebugInfo, IInteractiveUiElement } from "./interactive_element"
import { SquareUiElement } from "./square_ui_element"

export const ClickStates = {
    Clicked:    "clicked",
    UnClicked:  "unclicked"
}

export type ClickStateKeys = typeof ClickStates[keyof typeof ClickStates]

export class TwoStateSquareButton extends SquareUiElement {
    // A button that is either clicked or not clicked
    protected _clickState!: ClickStateKeys
    protected unClickedIcon: HTMLImageElement | undefined
    protected clickedIcon: HTMLImageElement | undefined
    protected unClickedBackground: HTMLImageElement | undefined
    protected clickedBackground: HTMLImageElement | undefined

    constructor(
        isActive: boolean,
        elementPosition: ScreenPosition,
        elementSize: Resolution,
        unClickedIcon: HTMLImageElement | undefined,
        clickedIcon: HTMLImageElement | undefined,
        unClickedBackground: HTMLImageElement | undefined,
        clickedBackground: HTMLImageElement | undefined,
        debugInfo: InteractiveElementDebugInfo,
    ) {
        const isClickable = true
        const children: IInteractiveUiElement[] = []
        super(isActive, isClickable, elementPosition, elementSize, debugInfo, children)
        
        this.unClickedIcon = unClickedIcon
        this.clickedIcon = clickedIcon
        this.unClickedBackground = unClickedBackground
        this.clickedBackground = clickedBackground
        
        this.clickState = ClickStates.UnClicked
        this.setActiveIcon(this.unClickedIcon)
        this.setActiveBackground(this.unClickedBackground)
    }

    get clickState() {
        return this._clickState
    }

    set clickState(clickState: ClickStateKeys) {
        if (this.clickState === clickState) {
            return
        }

        this._clickState = clickState
        switch (this.clickState) {
            case ClickStates.Clicked:
                this.setActiveIcon(this.clickedIcon)
                this.setActiveBackground(this.clickedBackground)
                break

            case ClickStates.UnClicked:
                this.setActiveIcon(this.unClickedIcon)
                this.setActiveBackground(this.unClickedBackground)
                break
        }
    }

    toggleClickState() {
        switch(this.clickState) {
            case ClickStates.Clicked:
                this.clickState = ClickStates.UnClicked
                break
            
            case ClickStates.UnClicked:
                this.clickState = ClickStates.Clicked
                break
        }
    }
}