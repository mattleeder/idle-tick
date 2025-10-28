import type { Camera, Resolution } from "./camera";
import type { EquipmentSlotKeys, PrayerKeys } from "./ecs_types";
import { INVENTORY_COLUMNS, INVENTORY_ROWS, INVENTORY_SIZE, protectFromMagicIcon, protectFromMeleeIcon, protectFromRangedIcon } from "./globals";
import { ScreenPosition } from "./position";
import { CompassButton } from "./ui/compass_button";
import { ControlledUiElement } from "./ui/controlled_ui_element";
import { DrainingButton } from "./ui/draining_button";
import { EquipmentButton, type EquipmentButtonData } from "./ui/equipment_button";
import { dummyInteractiveUiElement, type IInteractiveUiElement, type InteractiveElementDebugInfo } from "./ui/interactive_element";
import { InventoryButton } from "./ui/inventory_button";
import { PrayerButton, type PrayerButtonData } from "./ui/prayer_button";
import { RibbonButton } from "./ui/ribbon_button";
import { SquareUiElement } from "./ui/square_ui_element";
import { ClickStates } from "./ui/two_state_circular_button";
import { TwoStateHoveredSquareButton } from "./ui/two_state_hovered_square_button";
import { TwoStateSquareButton } from "./ui/two_state_square_button";
import { UiGroup } from "./ui/ui_group";
import { UiText } from "./ui/ui_text";
import { UiEngineCommunicator } from "./ui_engine_communicator";


const compassImage = new Image()
compassImage.src = "src/assets/compass.png"

const prayerBackgroundImage = new Image()
prayerBackgroundImage.src = "src/assets/prayerbackground.png"

const healthIconImage = new Image()
healthIconImage.src = "src/assets/healthicon.png"

const healthBackgroundImage = new Image()
healthBackgroundImage.src = "src/assets/healthbackground.png"

const specialAttackBackgroundImage = new Image()
specialAttackBackgroundImage.src = "src/assets/special_attack_background.png"

const combatIconImage = new Image()
combatIconImage.src = "src/assets/combaticon.png"

const staminaIconImage = new Image()
staminaIconImage.src = "src/assets/staminaicon.png"

const staminaUnclickedBackgroundImage = new Image()
staminaUnclickedBackgroundImage.src = "src/assets/stamina_background.png"

const staminaClickedBackgroundImage = new Image()
staminaClickedBackgroundImage.src = "src/assets/stamina_background_clicked.png"

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

const equipmentInformationImage = new Image()
equipmentInformationImage.src = "src/assets/equipment_information_button.png"

const crossImage = new Image()
crossImage.src = "src/assets/cross.png"

const greyBackgroundWithBlackBorder = new Image()
greyBackgroundWithBlackBorder.src = "src/assets/grey_background_with_black_border.png"

const orangeBackgroundWithBlackBorder = new Image()
orangeBackgroundWithBlackBorder.src = "src/assets/orange_background_with_black_border.png"

const blackSquare = new Image()
blackSquare.src = "src/assets/black_square.png"

const greySquare = new Image()
greySquare.src = "src/assets/grey_square.png"

function createRibbonGroupWithButton(
    isGroupActive: boolean,
    buttonPosition: ScreenPosition,
    buttonDimensions: Resolution,
    ribbonMenuController: ControlledUiElement,
    buttonIcon: HTMLImageElement,
    buttonUnclikedBackground: HTMLImageElement,
    buttonClickedBackground: HTMLImageElement,
    ribbonMenuDimensions: Resolution,
    groupDebugInfo: InteractiveElementDebugInfo,
    buttonDebugInfo: InteractiveElementDebugInfo,
): [UiGroup, RibbonButton] {

    const group = new UiGroup(
        isGroupActive,
        true,
        new ScreenPosition(-ribbonMenuDimensions.width, -ribbonMenuDimensions.height + buttonDimensions.height),
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

    const getPrayerData = () => {
        const data = uiEngineCommunicator.getCombatUIData()
        return {numerator: data.playerCurrentPrayerPoints, denominator: data.playerMaxPrayerPoints}
    }

    const getHealthData = () => {
        const data = uiEngineCommunicator.getCombatUIData()
        return {numerator: data.playerCurrentHealth, denominator: data.playerMaxHealth}
    }

    const getSpecialAttackData = () => {
        const data = uiEngineCommunicator.getCombatUIData()
        return {numerator: data.playerCurrentSpecialAttack, denominator: data.playerMaxSpecialAttack}
    }

    const getStaminaData = () => {
        const data = uiEngineCommunicator.getCombatUIData()
        return {numerator: data.playerCurrentStamina, denominator: data.playerMaxStamina}
    }

    const topButtonsGroup = new UiGroup(
        true,
        true,
        new ScreenPosition(camera.resolution.width, 0),
        {name: "topButtonsGroup"},
    )

    const compass = new CompassButton(true, new ScreenPosition(-camera.resolution.width * 0.03, camera.resolution.height * 0.1), 32, compassImage, uiEngineCommunicator, {name: "compassButton"})
    const prayer = new DrainingButton(true, new ScreenPosition(-camera.resolution.width * 0.09, camera.resolution.height * 0.1), 32, prayerIconImage, prayerIconImage, prayerBackgroundImage, prayerBackgroundImage, {name: "prayerTopButton"}, () => getPrayerData())
    const health = new DrainingButton(true, new ScreenPosition(-camera.resolution.width * 0.15, camera.resolution.height * 0.1), 32, healthIconImage, healthIconImage, healthBackgroundImage, healthBackgroundImage, {name: "healthTopButton"}, () => getHealthData())
    const specialAttack = new DrainingButton(true, new ScreenPosition(-camera.resolution.width * 0.21, camera.resolution.height * 0.1), 32, combatIconImage, combatIconImage, specialAttackBackgroundImage, specialAttackBackgroundImage, {name: "specialAttackTopButton"}, () => getSpecialAttackData())
    const stamina = new DrainingButton(true, new ScreenPosition(-camera.resolution.width * 0.27, camera.resolution.height * 0.1), 32, staminaIconImage, staminaIconImage, staminaUnclickedBackgroundImage, staminaClickedBackgroundImage, {name: "staminaTopButton"}, () => getStaminaData())

    topButtonsGroup.addChild(compass)
    topButtonsGroup.addChild(prayer)
    topButtonsGroup.addChild(health)
    topButtonsGroup.addChild(specialAttack)
    topButtonsGroup.addChild(stamina)


    // @TODO: some weird double clicking issue going on
    stamina.clickState = uiEngineCommunicator.isPlayerRunning() ? ClickStates.Clicked : ClickStates.UnClicked
    console.log(`Player is running: ${uiEngineCommunicator.isPlayerRunning()}, stamina click state: ${stamina.clickState}`)
    stamina.onMouseClick(() => {
        stamina.toggleClickState()
        switch(stamina.clickState) {
            case ClickStates.Clicked:
                console.log("Turning Run On")
                uiEngineCommunicator.turnOnRun()
                break;

            case ClickStates.UnClicked:
                console.log("Turning Run Off")
                uiEngineCommunicator.turnOffRun()
                break;
        }
    })

    uiEngineCommunicator.onPlayerZeroStamina(() => {
        uiEngineCommunicator.turnOffRun()
        stamina.clickState = ClickStates.UnClicked
    })
    
    const ribbonButtonDimensions = {width: camera.resolution.width * 0.05, height: camera.resolution.height * 0.05}
    const ribbonGroupScreenPosition = new ScreenPosition(camera.resolution.width * 0.75, camera.resolution.height * 0.65)
    // const ribbonGroupScreenPosition = new ScreenPosition(0, 0)
    const ribbonGroupDimensions = {width: camera.resolution.width * 0.25, height: camera.resolution.height * 0.35}
    const ribbonMenuDimensions = {width: ribbonGroupDimensions.width, height: ribbonGroupDimensions.height - 2 * ribbonButtonDimensions.height}
    const ribbonMenuBorderDimensions = {width: ribbonGroupDimensions.width + 4, height: ribbonGroupDimensions.height - ribbonButtonDimensions.height + 4}

    const equipmentButtonDimensions = {width: camera.resolution.width * 0.035, height: camera.resolution.height * 0.035}
    const ribbonGroup = new UiGroup(
        true,
        true,
        new ScreenPosition(camera.resolution.width, camera.resolution.height),
        {name: "ribbonGroup"},
    )

    const ribbonMenuController = new ControlledUiElement(dummyInteractiveUiElement)

    const ribbonMenuBackground = new SquareUiElement(
        true,
        false,
        new ScreenPosition(-ribbonMenuDimensions.width, -ribbonMenuDimensions.height),
        ribbonMenuDimensions,
        {name: "ribbonMenuBackground"},
    )

    ribbonMenuBackground.setActiveBackground(ribbonBackgroundImage)

    const ribbonMenuBorder = new SquareUiElement(
        true,
        false,
        new ScreenPosition(-ribbonMenuDimensions.width - 2, -ribbonMenuDimensions.height - 2),
        ribbonMenuBorderDimensions,
        {name: "ribbonMenuBorder"},
    )

    ribbonMenuBorder.setActiveBackground(blackSquare)

    const [combatMenuGroup, combatMenuButton] = createRibbonGroupWithButton(
        false,
        new ScreenPosition(-ribbonMenuDimensions.width, -ribbonMenuDimensions.height),
        ribbonButtonDimensions,
        ribbonMenuController,
        combatIconDefaultImage,
        ribbonBackgroundImage,
        ribbonButtonClickedBackground,
        ribbonMenuDimensions,
        {name: "combatMenuGroup"},
        {name: "combatMenuButton"}
    )

    const [inventoryMenuGroup, inventoryMenuButton] = createRibbonGroupWithButton(
        false,
        new ScreenPosition(-ribbonMenuDimensions.width + ribbonButtonDimensions.width, -ribbonMenuDimensions.height),
        ribbonButtonDimensions,
        ribbonMenuController,
        inventoryIconImage,
        ribbonBackgroundImage,
        ribbonButtonClickedBackground,
        ribbonMenuDimensions,
        {name: "inventoryMenuGroup"},
        {name: "inventoryMenuButton"}
    )

    for (let i = 0; i < INVENTORY_SIZE; i++) {
        const inventoryItemButton = createInventoryButton(i, ribbonMenuDimensions, uiEngineCommunicator)
        inventoryMenuGroup.addChild(inventoryItemButton)
    }

    const [equipmentMenuGroup, equipmentMenuButton] = createRibbonGroupWithButton(
        false,
        new ScreenPosition(-ribbonMenuDimensions.width + ribbonButtonDimensions.width * 2, -ribbonMenuDimensions.height),
        ribbonButtonDimensions,
        ribbonMenuController,
        equipmentIconImage,
        ribbonBackgroundImage,
        ribbonButtonClickedBackground,
        ribbonMenuDimensions,
        {name: "equipmentMenuGroup"},
        {name: "equipmentMenuButton"}
    )

    const equipmentInformationWindow = createEquipmentInformationWindow(uiEngineCommunicator)

    const equipmentButtons = createEquipmentButtons(equipmentButtonDimensions, uiEngineCommunicator, equipmentInformationWindow)
    for (const button of equipmentButtons) {
        equipmentMenuGroup.addChild(button)
    }

    const [prayerMenuGroup, prayerMenuButton] = createRibbonGroupWithButton(
        false,
        new ScreenPosition(-ribbonMenuDimensions.width + ribbonButtonDimensions.width * 3, -ribbonMenuDimensions.height),
        ribbonButtonDimensions,
        ribbonMenuController,
        prayerIconImage,
        ribbonBackgroundImage,
        ribbonButtonClickedBackground,
        ribbonMenuDimensions,
        {name: "prayerMenuGroup"},
        {name: "prayerMenuButton"}
    )

    const prayerButtons = createPrayerButtons(uiEngineCommunicator, ribbonButtonDimensions)
    for (const button of prayerButtons) {
        prayerMenuGroup.addChild(button)
    }

    const [spellsMenuGroup, spellsMenuButton] = createRibbonGroupWithButton(
        false,
        new ScreenPosition(-ribbonMenuDimensions.width + ribbonButtonDimensions.width * 4, -ribbonMenuDimensions.height),
        ribbonButtonDimensions,
        ribbonMenuController,
        spellsIconImage,
        ribbonBackgroundImage,
        ribbonButtonClickedBackground,
        ribbonMenuDimensions,
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

    ribbonGroup.addChild(ribbonMenuBorder)
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
        equipmentInformationWindow,
        topButtonsGroup,
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
        transparentBackground,
        buttonData,
        uiEngineCommunicator,
        {name: `inventorySlotPosition${slotPosition}`},
    )

    return button
}

function createEquipmentButtons(buttonDimensions: Resolution, uiEngineCommunicator: UiEngineCommunicator, equipmentWindow: UiGroup) {
    const equipmentButtonPositions: Record<EquipmentSlotKeys, ScreenPosition> = {
        head:       new ScreenPosition(110, 10),
        cape:       new ScreenPosition(50, 48),
        neck:       new ScreenPosition(110, 48),
        ammo:       new ScreenPosition(170, 48),
        mainHand:   new ScreenPosition(40, 86),
        chest:      new ScreenPosition(110, 86),
        offHand:    new ScreenPosition(180, 86),
        legs:       new ScreenPosition(110, 124),
        gloves:     new ScreenPosition(40, 162),
        boots:      new ScreenPosition(110, 162),
        ring:       new ScreenPosition(180, 162),
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
            greyBackgroundWithBlackBorder,
            equipmentButtonData,
            uiEngineCommunicator,
            {name: `equipmentSlotPosition${slot}`},
        )

        equipmentButtons.push(button)
    }

    const showStatsButton = new TwoStateSquareButton(
        true,
        new ScreenPosition(30, 210),
        buttonDimensions,
        equipmentInformationImage,
        equipmentInformationImage,
        greyBackgroundWithBlackBorder,
        greyBackgroundWithBlackBorder,
        {name: "equipmentInformationButton"},
    )

    equipmentButtons.push(showStatsButton)

    showStatsButton.onMouseClick(() => {
        uiEngineCommunicator.openWindow(equipmentWindow)
        console.log("Opening equipment window")
    })

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

function createEquipmentInformationWindow(uiEngineCommunicator: UiEngineCommunicator) {
    const equipmentWindowDimensions = {width: 500, height: 500}
    const equipmentWindowBorderDimensions = {width: 504, height: 504}
    const windowGroup = new UiGroup(
        false, 
        true, 
        new ScreenPosition(0, 0), 
        {name: "equipmentWindow"}
    )

    const equipmentWindowBackground = new SquareUiElement(
        true,
        false,
        new ScreenPosition(0, 0),
        equipmentWindowDimensions,
        {name: "equipmentWindowBackground"},
    )

    const equipmentWindowBorder = new SquareUiElement(
        true,
        false,
        new ScreenPosition(-2, -2),
        equipmentWindowBorderDimensions,
        {name: "equipmentWindowBorder"},
    )

    equipmentWindowBackground.setActiveBackground(greySquare)

    equipmentWindowBorder.setActiveBackground(blackSquare)

    const equipmentInformation = uiEngineCommunicator.getEquipmentWindowInformation()
    const sections = ["Attack", "Defence", "Other"]
    let textPosition = new ScreenPosition(250, 60)
    const textElements = []
    for (const section of sections) {
        const sectionHeader = new UiText(
            `${section} bonuses:`,
            true,
            false,
            textPosition,
            {width: 0, height: 0},
            {name: `${section} header text`}
        )
        textPosition = textPosition.add(new ScreenPosition(0, 10))
        textElements.push(sectionHeader)

        for (const [key, value] of Object.entries(equipmentInformation[section])) {
            const text = new UiText(
                `${key}: ${value}`,
                true,
                false,
                textPosition,
                {width: 0, height: 0},
                {name: `${section}: ${key} text`}
            )

            textPosition = textPosition.add(new ScreenPosition(0, 10))
            textElements.push(text)
        }
        textPosition = textPosition.add(new ScreenPosition(0, 10))
    }

    windowGroup.onActive(() => {
        const newEquipmentInformation = uiEngineCommunicator.getEquipmentWindowInformation()
        console.log(newEquipmentInformation)
        let i = 0
        for (const section of sections) {
            i += 1
            for (const [key, value] of Object.entries(newEquipmentInformation[section])) {
                textElements[i].textContent = `${key}: ${value}`
                i += 1
            }
        }
    })

    const closeButton = new TwoStateHoveredSquareButton (
        true,
        new ScreenPosition(440, 10),
        {width: 50, height: 50},
        crossImage,
        crossImage,
        greyBackgroundWithBlackBorder,
        orangeBackgroundWithBlackBorder,
        {name: "closeEquipmentWindowButton"}
    )

    closeButton.onMouseClick(() => {
        uiEngineCommunicator.closeWindow(windowGroup)
    })

    windowGroup.addChild(equipmentWindowBorder)
    windowGroup.addChild(equipmentWindowBackground)
    windowGroup.addChild(closeButton)
    for (const element of textElements) {
        windowGroup.addChild(element)
    }

    return windowGroup
}