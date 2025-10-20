import type { PlayerDataGrabber } from "../access_player_data"
import type { Resolution } from "../camera"
import type { ItemDetailsComponent } from "../ecs_components"
import { InventoryUseType } from "../ecs_types"
import type { INVENTORY_COLUMNS, INVENTORY_ROWS, INVENTORY_SIZE } from "../globals"
import type { ScreenPosition } from "../position"
import type { InteractiveElementDebugInfo, IInteractiveUiElement, InteractiveUiElementStateImages } from "./interactive_element"
import { RibbonMenu } from "./ui_group"

export class InventoryMenu extends RibbonMenu {
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
        super.onMouseDown()
    }

    private getPlayerInventory(): Array<ItemDetailsComponent | null> {
        const combatUiData = this.playerDataGrabber.getCombatUIData()
        return combatUiData.playerInventory
    }

    onClick(click: ScreenPosition): void {
        const position = this.getPosition()
        const size = this.getSize()
        const columnWidth = size.width / INVENTORY_COLUMNS
        const rowHeight = size.height / INVENTORY_ROWS

        const clickOffset = click.sub(position)

        const clickColumn = Math.floor(clickOffset.x / columnWidth)
        const clickRow = Math.floor(clickOffset.y / rowHeight)

        const itemsPerRow = INVENTORY_SIZE / INVENTORY_ROWS
        const itemsPerColumn = INVENTORY_SIZE / INVENTORY_COLUMNS

        const itemClick = clickRow * itemsPerRow + clickColumn

        console.log(`Clicked on item ${itemClick}`)

        const item = this.getPlayerInventory()[itemClick]
        if (item === null) {
            return
        }

        const itemEntity = this.playerDataGrabber.getInventory()[itemClick]

        switch(item.itemType) {
            case InventoryUseType.Equip:
                this.playerDataGrabber.inputQueue.queueEquipmentChange(itemEntity)
                break;
            default:
                return
        }
    }

    getInventorySlotPosition(slot: number): ScreenPosition {
        const size = this.getSize()
        const columnWidth = size.width / INVENTORY_COLUMNS
        const rowHeight = size.height / INVENTORY_ROWS

        const itemsPerRow = INVENTORY_SIZE / INVENTORY_ROWS

        const slotRow = Math.floor(slot / itemsPerRow)
        const slotColumn = slot % itemsPerRow

        const topLeftPositionOffset = new ScreenPosition(slotColumn * columnWidth, slotRow * rowHeight)

        // console.log(`topLeftPositionOffset: ${topLeftPositionOffset.x}, ${topLeftPositionOffset.y}, absolutePosition: ${this.getPosition().add(topLeftPositionOffset).x}, ${this.getPosition().add(topLeftPositionOffset).y}`)

        return this.getPosition().add(topLeftPositionOffset)
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx)

        const playerInventory = this.getPlayerInventory()
        const size = this.getSize()
        const columnWidth = size.width / INVENTORY_COLUMNS
        const rowHeight = size.height / INVENTORY_ROWS

        for (let i = 0; i < INVENTORY_SIZE; i++) {
            if (playerInventory[i] !== null) {
                // draw
                // console.log(`Item in slot: ${i}`)

                const modelImage = new Image()
                modelImage.src = playerInventory[i].icon

                const position = this.getInventorySlotPosition(i)

                ctx.drawImage(
                    modelImage,
                    position.x,
                    position.y,
                    columnWidth,
                    rowHeight,                    
                )
            }
        }
    }

}