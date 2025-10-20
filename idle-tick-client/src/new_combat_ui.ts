import { PlayerDataGrabber } from "./access_player_data";
import type { Camera, Resolution } from "./camera";
import type { EquipmentSlotKeys, PrayerKeys } from "./ecs_types";
import { INVENTORY_COLUMNS, INVENTORY_ROWS, INVENTORY_SIZE, protectFromMagicIcon, protectFromMeleeIcon, protectFromRangedIcon } from "./globals";
import { ScreenPosition } from "./position";
import { ControlledUiElement } from "./ui/controlled_ui_element";
import { EquipmentButton, type EquipmentButtonData } from "./ui/equipment_button";
import { dummyInteractiveUiElement, type IInteractiveUiElement, type InteractiveElementDebugInfo } from "./ui/interactive_element";
import { InventoryButton } from "./ui/inventory_button";
import { PrayerButton, type PrayerButtonData } from "./ui/prayer_button";
import { RibbonButton } from "./ui/ribbon_button";
import { SquareUiElement } from "./ui/square_ui_element";
import { UiGroup } from "./ui/ui_group";
import { UiEngineCommunicator } from "./ui_engine_communicator";


const transparentBackground = new Image()
transparentBackground.src = "src/assets/transparent_background.png"

const ribbonButtonClickedBackground = new Image()
ribbonButtonClickedBackground.src = "src/assets/ribbon_button_clicked.png"

const combatIconDefaultImage = new Image()
combatIconDefaultImage.src = "src/assets/combaticon.png"

const inventoryIconImage = new Image()
inventoryIconImage.src = "src/assets/inventoryicon.png"

const equipmentIconImage = new Image()
equipmentIconImage.src = "src/assets/equipmenticon.png"

const prayerIconImage = new Image()
prayerIconImage.src = "src/assets/prayericon.png"

const spellsIconImage = new Image()
spellsIconImage.src = "src/assets/spellicon.png"

const ribbonBackgroundImage = new Image()
ribbonBackgroundImage.src = "src/assets/ribbonbackground.png"

function createRibbonGroupWithButton(
    isGroupActive: boolean,
    buttonPosition: ScreenPosition,
    buttonDimensions: Resolution,
    ribbonMenuController: ControlledUiElement,
    buttonIcon: HTMLImageElement,
    buttonUnclikedBackground: HTMLImageElement,
    buttonClickedBackground: HTMLImageElement,
    groupDebugInfo: InteractiveElementDebugInfo,
    buttonDebugInfo: InteractiveElementDebugInfo,
): [UiGroup, RibbonButton] {

    const group = new UiGroup(
        isGroupActive,
        true,
        new ScreenPosition(0, buttonDimensions.height),
        groupDebugInfo,
    )

    const button = new RibbonButton(
        true,
        buttonPosition,
        buttonDimensions,
        ribbonMenuController,
        buttonIcon,
        buttonUnclikedBackground,
        buttonClickedBackground,
        buttonDebugInfo,
        group,
    )

    return [group, button]
}

export function createNewUIElements(uiEngineCommunicator: UiEngineCommunicator, camera: Camera): IInteractiveUiElement[] {
    const ribbonButtonDimensions = {width: camera.resolution.width * 0.05, height: camera.resolution.height * 0.05}
    // const ribbonGroupScreenPosition = new ScreenPosition(camera.resolution.width * 0.75, camera.resolution.height * 0.65)
    const ribbonGroupScreenPosition = new ScreenPosition(0, 0)
    const ribbonGroupDimensions = {width: camera.resolution.width * 0.25, height: camera.resolution.height * 0.35}
    const ribbonMenuDimensions = {width: ribbonGroupDimensions.width, height: ribbonGroupDimensions.height - 2 * ribbonButtonDimensions.height}
    const ribbonGroup = new UiGroup(
        true,
        true,
        ribbonGroupScreenPosition,
        {name: "ribbonGroup"},
    )

    const ribbonMenuController = new ControlledUiElement(dummyInteractiveUiElement)

    const ribbonMenuBackground = new SquareUiElement(
        true,
        false,
        new ScreenPosition(0, ribbonButtonDimensions.height),
        ribbonMenuDimensions,
        {name: "ribbonMenuBackground"},
    )

    ribbonMenuBackground.setActiveBackground(ribbonBackgroundImage)

    const [combatMenuGroup, combatMenuButton] = createRibbonGroupWithButton(
        false,
        new ScreenPosition(0, 0),
        ribbonButtonDimensions,
        ribbonMenuController,
        combatIconDefaultImage,
        ribbonBackgroundImage,
        ribbonButtonClickedBackground,
        {name: "combatMenuGroup"},
        {name: "combatMenuButton"}
    )

    const [inventoryMenuGroup, inventoryMenuButton] = createRibbonGroupWithButton(
        false,
        new ScreenPosition(ribbonButtonDimensions.width, 0),
        ribbonButtonDimensions,
        ribbonMenuController,
        inventoryIconImage,
        ribbonBackgroundImage,
        ribbonButtonClickedBackground,
        {name: "inventoryMenuGroup"},
        {name: "inventoryMenuButton"}
    )

    for (let i = 0; i < INVENTORY_SIZE; i++) {
        const inventoryItemButton = createInventoryButton(i, ribbonMenuDimensions, uiEngineCommunicator)
        inventoryMenuGroup.addChild(inventoryItemButton)
    }

    const [equipmentMenuGroup, equipmentMenuButton] = createRibbonGroupWithButton(
        false,
        new ScreenPosition(ribbonButtonDimensions.width * 2, 0),
        ribbonButtonDimensions,
        ribbonMenuController,
        equipmentIconImage,
        ribbonBackgroundImage,
        ribbonButtonClickedBackground,
        {name: "equipmentMenuGroup"},
        {name: "equipmentMenuButton"}
    )

    const equipmentButtons = createEquipmentButtons(ribbonButtonDimensions, uiEngineCommunicator)
    for (const button of equipmentButtons) {
        equipmentMenuGroup.addChild(button)
    }

    const [prayerMenuGroup, prayerMenuButton] = createRibbonGroupWithButton(
        false,
        new ScreenPosition(ribbonButtonDimensions.width * 3, 0),
        ribbonButtonDimensions,
        ribbonMenuController,
        prayerIconImage,
        ribbonBackgroundImage,
        ribbonButtonClickedBackground,
        {name: "prayerMenuGroup"},
        {name: "prayerMenuButton"}
    )

    const prayerButtons = createPrayerButtons(uiEngineCommunicator, ribbonButtonDimensions)
    for (const button of prayerButtons) {
        prayerMenuGroup.addChild(button)
    }

    const [spellsMenuGroup, spellsMenuButton] = createRibbonGroupWithButton(
        false,
        new ScreenPosition(ribbonButtonDimensions.width * 4, 0),
        ribbonButtonDimensions,
        ribbonMenuController,
        spellsIconImage,
        ribbonBackgroundImage,
        ribbonButtonClickedBackground,
        {name: "spellsMenuGroup"},
        {name: "spellsMenuButton"}
    )

    
    const linkedButtons = [combatMenuButton]
    
    for (const button of linkedButtons) {
        ribbonMenuController.onActiveChange(() => {
            if (button.childElement !== ribbonMenuController.activeElement) {
                button.isClicked = false
            }
        })
    }

    ribbonGroup.addChild(ribbonMenuBackground)
    ribbonGroup.addChild(ribbonMenuController)
    ribbonGroup.addChild(combatMenuButton)
    ribbonGroup.addChild(combatMenuGroup)
    ribbonGroup.addChild(inventoryMenuButton)
    ribbonGroup.addChild(inventoryMenuGroup)
    ribbonGroup.addChild(equipmentMenuButton)
    ribbonGroup.addChild(equipmentMenuGroup)
    ribbonGroup.addChild(prayerMenuButton)
    ribbonGroup.addChild(prayerMenuGroup)
    ribbonGroup.addChild(spellsMenuButton)
    ribbonGroup.addChild(spellsMenuGroup)

    return [
        ribbonGroup,
    ]
}

function createInventoryButton(slotNumber: number, inventoryDimensions: Resolution, uiEngineCommunicator: UiEngineCommunicator) {
    const buttonRow = Math.floor(slotNumber / INVENTORY_COLUMNS)
    const buttonCol = slotNumber % INVENTORY_COLUMNS

    const rowHeight = inventoryDimensions.height / INVENTORY_ROWS
    const colWidth = inventoryDimensions.width / INVENTORY_COLUMNS

    const slotPosition = new ScreenPosition(buttonCol * colWidth, buttonRow * rowHeight)

    const buttonData = {
        slotNumber: slotNumber
    }

    const emptyEquipSlot = new Image()
    emptyEquipSlot.src = "src/assets/empty_equip_slot.png"

    const button = new InventoryButton(
        true,
        slotPosition,
        {width: colWidth, height: rowHeight},
        emptyEquipSlot,
        buttonData,
        uiEngineCommunicator,
        {name: `inventorySlotPosition${slotPosition}`},
    )

    return button
}

function createEquipmentButtons(buttonDimensions: Resolution, uiEngineCommunicator: UiEngineCommunicator) {
    const equipmentButtonPositions: Record<EquipmentSlotKeys, ScreenPosition> = {
        head:       new ScreenPosition(100, 0),
        cape:       new ScreenPosition(40, 55),
        neck:       new ScreenPosition(100, 55),
        ammo:       new ScreenPosition(160, 55),
        mainHand:   new ScreenPosition(30, 110),
        chest:      new ScreenPosition(100, 110),
        offHand:    new ScreenPosition(170, 110),
        legs:       new ScreenPosition(100, 165),
        gloves:     new ScreenPosition(30, 220),
        boots:      new ScreenPosition(100, 220),
        ring:       new ScreenPosition(170, 220),
    }

    const emptyEquipSlot = new Image()
    emptyEquipSlot.src = "src/assets/empty_equip_slot.png"

    const equipmentButtons = []

    for (const [slot, position] of Object.entries(equipmentButtonPositions)) {
        const equipmentButtonData: EquipmentButtonData = {
            slotType: slot,
        }

        const button = new EquipmentButton(
            true,
            position,
            buttonDimensions,
            emptyEquipSlot,
            equipmentButtonData,
            uiEngineCommunicator,
            {name: `equipmentSlotPosition${slot}`},
        )

        equipmentButtons.push(button)
    }

    return equipmentButtons

}

function createPrayerButtons(uiEngineCommunicator: UiEngineCommunicator, buttonDimensions: Resolution) {
    const prayerButtonPositions: Record<PrayerKeys, {icon: HTMLImageElement, position: ScreenPosition}> = {
        protectMage:  {icon: protectFromMagicIcon, position: new ScreenPosition(30, 100)},
        protectRange: {icon: protectFromRangedIcon, position: new ScreenPosition(100, 100)},
        protectMelee: {icon: protectFromMeleeIcon, position: new ScreenPosition(170, 100)},
    }

    const prayerButtons = []

    for (const [slot, data] of Object.entries(prayerButtonPositions)) {
        const prayerButtonData: PrayerButtonData = {
            prayerType: slot,
        }

        const button = new PrayerButton(
            true,
            data.position,
            buttonDimensions,
            data.icon,
            prayerButtonData,
            uiEngineCommunicator,
            {name: `prayerType${slot}`},
        )

        prayerButtons.push(button)
    }

    return prayerButtons
}