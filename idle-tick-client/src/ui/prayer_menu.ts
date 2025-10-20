import type { PlayerDataGrabber } from "../access_player_data"
import type { Resolution } from "../camera"
import type { ScreenPosition } from "../position"
import type { InteractiveElementDebugInfo, IInteractiveUiElement, InteractiveUiElementStateImages } from "./interactive_element"
import { RibbonMenu } from "./ui_group"

export class PrayerMenu extends RibbonMenu {
    private playerDataGrabber: PlayerDataGrabber

    constructor(
        isActive: boolean,
        isClickable: boolean,
        elementPosition: ScreenPosition,
        elementSize: Resolution,
        iconRecord: InteractiveUiElementStateImages,
        backgroundRecord: InteractiveUiElementStateImages,
        playerDataGrabber: PlayerDataGrabber,
        debugInfo: InteractiveElementDebugInfo,
    ) {
        // @TODO: maybe whenever something is added into the inventory we create a square element for it instead
        const children: IInteractiveUiElement[] = []
        super(isActive, isClickable, elementPosition, elementSize, iconRecord, backgroundRecord, debugInfo, children)
        this.playerDataGrabber = playerDataGrabber
        super.onActive(() => this.updateActivePrayers())
    }

    updateActivePrayers() {

    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.updateActivePrayers()
        super.draw(ctx)
    }

}