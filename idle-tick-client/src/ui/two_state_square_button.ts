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
    protected _unClickedIcon: HTMLImageElement | undefined
    protected _clickedIcon: HTMLImageElement | undefined
    protected _unClickedBackground: HTMLImageElement | undefined
    protected _clickedBackground: HTMLImageElement | undefined

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
        
        this._unClickedIcon = unClickedIcon
        this._clickedIcon = clickedIcon
        this._unClickedBackground = unClickedBackground
        this._clickedBackground = clickedBackground
        
        this.clickState = ClickStates.UnClicked
        this.setActiveIcon(this.unClickedIcon)
        this.setActiveBackground(this.unClickedBackground)
    }

    get unClickedIcon() {
        return this._unClickedIcon
    }

    get clickedIcon() {
        return this._clickedIcon
    }

    get unClickedBackground() {
        return this._unClickedBackground
    }

    get clickedBackground() {
        return this._clickedBackground
    }

    set unClickedIcon(newUnclickedIcon: HTMLImageElement | undefined) {
        this._unClickedIcon = newUnclickedIcon
        if (this.clickState == ClickStates.UnClicked) {
            this.setActiveIcon(this.unClickedIcon)
        }
    }

    set clickedIcon(newClickedIcon: HTMLImageElement | undefined) {
        this._clickedIcon = newClickedIcon
        if (this.clickState == ClickStates.Clicked) {
            this.setActiveIcon(this.clickedIcon)
        }
    }

    set unClickedBackground(newUnclickedBackground: HTMLImageElement | undefined) {
        this._unClickedBackground = newUnclickedBackground
        if (this.clickState == ClickStates.UnClicked) {
            this.setActiveBackground(this.unClickedBackground)
        }
    }

    set clickedBackground(newClickedBackground: HTMLImageElement | undefined) {
        this._clickedBackground = newClickedBackground
        if (this.clickState == ClickStates.Clicked) {
            this.setActiveBackground(this.clickedBackground)
        }
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