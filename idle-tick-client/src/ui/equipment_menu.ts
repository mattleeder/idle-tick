import type { PlayerDataGrabber } from "../access_player_data"
import type { Resolution } from "../camera"
import type { PlayerEquipmentComponent } from "../ecs_components"
import type { Entity, EquipmentSlotKeys } from "../ecs_types"
import type { ScreenPosition } from "../position"
import type { InteractiveElementDebugInfo, IInteractiveUiElement, InteractiveUiElementStateImages } from "./interactive_element"
import { RibbonMenu } from "./ui_group"

export class EquipmentMenu extends RibbonMenu {
    private playerDataGrabber: PlayerDataGrabber
    private uiSlotMap: Record<EquipmentSlotKeys, {ui: IInteractiveUiElement, defaultIcon: HTMLImageElement}>
    private lastKnownPlayerEquipment: PlayerEquipmentComponent

    constructor(
        isActive: boolean,
        isClickable: boolean,
        elementPosition: ScreenPosition,
        elementSize: Resolution,
        iconRecord: InteractiveUiElementStateImages,
        backgroundRecord: InteractiveUiElementStateImages,
        uiSlotMap: Record<EquipmentSlotKeys, {ui: IInteractiveUiElement, defaultIcon: HTMLImageElement}>,
        playerDataGrabber: PlayerDataGrabber,
        debugInfo: InteractiveElementDebugInfo,
    ) {
        // @TODO: maybe whenever something is added into the inventory we create a square element for it instead
        const children: IInteractiveUiElement[] = [
            uiSlotMap.head.ui,
            uiSlotMap.cape.ui,
            uiSlotMap.neck.ui,
            uiSlotMap.ammo.ui,
            uiSlotMap.mainHand.ui,
            uiSlotMap.chest.ui,
            uiSlotMap.offHand.ui,
            uiSlotMap.legs.ui,
            uiSlotMap.gloves.ui,
            uiSlotMap.boots.ui,
            uiSlotMap.ring.ui,
        ]
        super(isActive, isClickable, elementPosition, elementSize, iconRecord, backgroundRecord, debugInfo, children)
        this.playerDataGrabber = playerDataGrabber
        this.uiSlotMap = uiSlotMap

        this.lastKnownPlayerEquipment = {
            head: null,
            cape: null,
            neck: null,
            ammo: null,
            mainHand: null,
            chest: null,
            offHand: null,
            legs: null,
            gloves: null,
            boots: null,
            ring: null,
        }

        super.onActive(() => this.updateEquippedEntities())
    }

    private getPlayerEquipment(): PlayerEquipmentComponent {
        return this.playerDataGrabber.getEquipment()
    }

    updateEquippedEntities() {
        const currentPlayerEquipment = this.getPlayerEquipment()

        Object.entries(currentPlayerEquipment).forEach(([key, value]: [string, Entity | null]) => {
            const currentlyEquipped = this.lastKnownPlayerEquipment[key as keyof PlayerEquipmentComponent]

            if (currentlyEquipped != value) {
                console.log("Changing icon")
                if (value === null) {
                    this.uiSlotMap[key as keyof PlayerEquipmentComponent].ui.setIcon(this.uiSlotMap[key as keyof PlayerEquipmentComponent].defaultIcon)
                } else {
                    const newIcon = new Image()
                    newIcon.src = this.playerDataGrabber.getItemDetails(value).icon
                    this.uiSlotMap[key].ui.setIcon(newIcon)
                }
            }
        })

        this.lastKnownPlayerEquipment = {...currentPlayerEquipment}
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.updateEquippedEntities()
        super.draw(ctx)
    }

}