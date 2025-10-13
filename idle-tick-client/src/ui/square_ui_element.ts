import type { Resolution } from "../camera"
import { ScreenPosition } from "../position"
import { InteractiveElement, type IInteractiveUiElement, type InteractiveElementDebugInfo, type InteractiveUiElementStateImages } from "./interactive_element"

export class SquareUiElement extends InteractiveElement<Resolution> {

    protected activeBackground: HTMLImageElement | undefined
    protected backgroundRecord: InteractiveUiElementStateImages

    protected activeIcon: HTMLImageElement | undefined
    protected iconRecord: InteractiveUiElementStateImages

    constructor(
        isActive: boolean,
        isClickable: boolean,
        elementPosition: ScreenPosition,
        elementSize: Resolution,
        iconRecord: InteractiveUiElementStateImages,
        backgroundRecord: InteractiveUiElementStateImages,
        debugInfo: InteractiveElementDebugInfo,
        children: IInteractiveUiElement[] = []
    ) {
        super(isActive, isClickable, elementPosition, elementSize, debugInfo, children)
        this.iconRecord = iconRecord
        this.backgroundRecord = backgroundRecord

        this.activeIcon = iconRecord["default"]
        this.activeBackground = backgroundRecord["default"]

        this.onMouseEnter(() => {
            if (this.isDown) {
                this.setActiveIcon(this.iconRecord["down"])
                return
            }
            this.setActiveIcon(this.iconRecord["hovered"])
        })
        this.onMouseEnter(() => {
            if (this.isDown) {
                this.setActiveBackground(this.backgroundRecord["down"])
                return
            }
            this.setActiveBackground(this.backgroundRecord["hovered"])
        })

        this.onMouseLeave(() => this.setActiveIcon(this.iconRecord["default"]))
        this.onMouseLeave(() => this.setActiveBackground(this.backgroundRecord["default"]))

        this.onMouseDown(() => this.setActiveIcon(this.iconRecord["down"]))
        this.onMouseDown(() => this.setActiveBackground(this.backgroundRecord["down"]))

        this.onMouseClick(() => this.setActiveIcon(this.iconRecord["clicked"]))
        this.onMouseClick(() => this.setActiveBackground(this.backgroundRecord["clicked"]))
    }

    setActiveBackground(newBackground: HTMLImageElement | undefined) {
        this.activeBackground = newBackground
    }

    setActiveIcon(newIcon: HTMLImageElement | undefined) {
        this.activeIcon = newIcon    
    }
    
    mouseWithinBoundary(mousePositionX: number, mousePositionY: number): boolean {
        console.log(`Check boundary, mouse: ${mousePositionX},${mousePositionY}, element: ${this.elementPosition.x},${this.elementPosition.y}`)
        if (!(this.isActive)) {
            return false
        }

        if (mousePositionX < this.elementPosition.x || mousePositionX > this.elementPosition.x + this.elementSize.width) {
            return false
        }

        if (mousePositionY < this.elementPosition.y || mousePositionY > this.elementPosition.y + this.elementSize.height) {
            return false
        }


        return true
    }

    draw(ctx: CanvasRenderingContext2D){
        if (!this.isActive) {
            return
        }
        
        ctx.save()

        // ctx.strokeStyle = "#000000"
        // ctx.strokeRect(this.elementPosition.x, this.elementPosition.y, this.elementSize.width,  this.elementSize.height)

        if (this.activeBackground !== undefined) {
            ctx.drawImage(
                this.activeBackground,
                this.elementPosition.x,
                this.elementPosition.y,
                this.elementSize.width,
                this.elementSize.height
            )
        }

        if (this.activeIcon !== undefined) {
            ctx.drawImage(
                this.activeIcon,
                this.elementPosition.x,
                this.elementPosition.y,
                this.elementSize.width,
                this.elementSize.height
            )
        }

        for(const child of this.children) {
            child.draw(ctx)
        }

        ctx.restore()
    }
}

const defaultIcon = new Image()
const hoveredIcon = new Image()
const downIcon = new Image()
const clickedIcon = new Image()

defaultIcon.src = "src/assets/test_square_button_default_icon.png"
hoveredIcon.src = "src/assets/test_square_button_hovered_icon.png"
downIcon.src = "src/assets/test_square_button_down_icon.png"
clickedIcon.src = "src/assets/test_square_button_clicked_icon.png"

const defaultBackground = new Image()
const hoveredBackground = new Image()
const downBackground = new Image()
const clickedBackground = new Image()

defaultBackground.src = "src/assets/test_square_button_default_background.png"
hoveredBackground.src = "src/assets/test_square_button_hovered_background.png"
downBackground.src = "src/assets/test_square_button_down_background.png"
clickedBackground.src = "src/assets/test_square_button_clicked_background.png"

export const testSquareButton = new SquareUiElement(
    true,
    true,
    new ScreenPosition(100, 100),
    {width: 200, height: 200},
    {
        default: defaultIcon,
        hovered: hoveredIcon,
        clicked: clickedIcon,
        down: downIcon,
    },
    {
        default: defaultBackground,
        hovered: hoveredBackground,
        clicked: clickedBackground,
        down: downBackground,
    },
    {name: "testSquareButton"}
)