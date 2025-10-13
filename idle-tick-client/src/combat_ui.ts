import type { PlayerDataGrabber } from "./access_player_data";
import type { Camera, Resolution } from "./camera";
import type { ItemDetailsComponent, PlayerEquipmentComponent } from "./ecs_components";
import { EquipmentSlots, InventoryUseType, Prayers, type EquipmentSlotKeys } from "./ecs_types";
import { INVENTORY_COLUMNS, INVENTORY_ROWS, INVENTORY_SIZE, protectFromMagicIcon, protectFromMeleeIcon, protectFromRangedIcon } from "./globals";
import { ScreenPosition } from "./position";

export interface CombatUI {
    getIsActive(): boolean;
    setIsActive(isActive: boolean): void

    getIsClickable(): boolean;
    setIsClickable(isClickable: boolean): void;

    getPosition(): ScreenPosition;
    setPosition(newScreenPosition: ScreenPosition): void;

    getSize(): Resolution | number;
    setSize(newSize: Resolution | number): void;

    getBackground(): HTMLImageElement | undefined;
    setBackground(newBackground: HTMLImageElement | undefined): void;

    getIcon(): HTMLImageElement | undefined;
    setIcon(newIcon: HTMLImageElement | undefined): void;

    wasClicked(click: ScreenPosition): boolean;
    onClick(click: ScreenPosition): void;
    draw(ctx: CanvasRenderingContext2D): void;
}

class SquareUIElement {

    wasClicked(buttonPosition: ScreenPosition, buttonSize: Resolution, clickPosition: ScreenPosition, isButtonActive: boolean, isButtonClickable: boolean) {
        if (!(isButtonActive && isButtonClickable)) {
            return false
        }

        if (clickPosition.x < buttonPosition.x || clickPosition.x > buttonPosition.x + buttonSize.width) {
            return false
        }

        if (clickPosition.y < buttonPosition.y || clickPosition.y > buttonPosition.y + buttonSize.height) {
            return false
        }

        return true
    }

    draw(ctx: CanvasRenderingContext2D, buttonPosition: ScreenPosition, buttonSize: Resolution, buttonBackground: HTMLImageElement | undefined, buttonIcon: HTMLImageElement | undefined): void {
        ctx.strokeStyle = "#000000"
        ctx.strokeRect(buttonPosition.x, buttonPosition.y, buttonSize.width,  buttonSize.height)

        if (buttonBackground !== undefined) {
            ctx.drawImage(
                buttonBackground,
                buttonPosition.x,
                buttonPosition.y,
                buttonSize.width,
                buttonSize.height
            )
        }

        if (buttonIcon !== undefined) {
            ctx.drawImage(
                buttonIcon,
                buttonPosition.x,
                buttonPosition.y,
                buttonSize.width,
                buttonSize.height
            )
        }
    }
}

class CircularUIElement {
    
    wasClicked(buttonPosition: ScreenPosition, buttonRadius: number, clickPosition: ScreenPosition, isButtonActive: boolean, isButtonClickable: boolean) {
        if (!(isButtonActive && isButtonClickable)) {
            return false
        }

        if (((clickPosition.x - buttonPosition.x) ** 2 + (clickPosition.y - buttonPosition.y) ** 2) < buttonRadius ** 2) {
            return true
        }

        return false
    }

    draw(ctx: CanvasRenderingContext2D, buttonPosition: ScreenPosition, buttonRadius: number, buttonBackground: HTMLImageElement | undefined, buttonIcon: HTMLImageElement | undefined): void {
        ctx.strokeStyle = "#000000"
        ctx.beginPath()
        ctx.arc(buttonPosition.x, buttonPosition.y, buttonRadius, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.clip()

        if (buttonBackground !== undefined) {
            ctx.drawImage(
                buttonBackground,
                buttonPosition.x - buttonRadius,
                buttonPosition.y - buttonRadius,
                buttonRadius * 2,
                buttonRadius * 2,
            )
        }

        if (buttonIcon !== undefined) {
            ctx.drawImage(
                buttonIcon,
                buttonPosition.x - buttonRadius,
                buttonPosition.y - buttonRadius,
                buttonRadius * 2,
                buttonRadius * 2,
            )
        }
    }

}

class CircularButton implements CombatUI {
    private _isActive: boolean;
    private _isClickable: boolean;
    private _position: ScreenPosition;
    private _size: number;
    private circularUIElement: CircularUIElement;
    private _background: HTMLImageElement | undefined;
    private _icon: HTMLImageElement | undefined;

    constructor(isActive: boolean, isClickable: boolean, position: ScreenPosition, size: number, background: HTMLImageElement | undefined, icon: HTMLImageElement) {
        this._isActive = isActive
        this._isClickable = isClickable
        this._position = position
        this._size = size
        this.circularUIElement = new CircularUIElement()
        this._background = background
        this._icon = icon
    }

    getIsActive(): boolean {
        return this._isActive
    }

    setIsActive(isActive: boolean) {
        this._isActive = isActive
    }

    getIsClickable() {
        return this._isClickable
    }

    setIsClickable(isClickable: boolean) {
        this._isClickable = isClickable
    }

    getPosition() {
        return this._position
    }

    setPosition(newPosition: ScreenPosition) {
        this._position = newPosition
    }

    getSize() {
        return this._size
    }

    setSize(newSize: number) {
        this._size = newSize
    }

    getBackground(): HTMLImageElement | undefined {
        return this._background
    }

    setBackground(newBackground: HTMLImageElement | undefined): void {
        this._background = newBackground
    }    

    getIcon(): HTMLImageElement | undefined {
        return this._icon
    }

    setIcon(newIcon: HTMLImageElement | undefined): void {
        this._icon = newIcon
    }

    wasClicked(click: ScreenPosition): boolean {
        return this.circularUIElement.wasClicked(this.getPosition(), this.getSize(), click, this.getIsActive(), this.getIsClickable())
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onClick(_click: ScreenPosition): void {
        
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.circularUIElement.draw(ctx, this.getPosition(), this.getSize(), this.getBackground(), this.getIcon())
    }
}

class CompassButton implements CombatUI {
    private cicularButton: CircularButton;
    private camera: Camera;

    constructor(isActive: boolean, isClickable: boolean, position: ScreenPosition, size: number, icon: HTMLImageElement, camera: Camera) {
        const background = undefined
        this.cicularButton = new CircularButton(isActive, isClickable, position, size, background, icon)
        this.camera = camera
    }

    getIsActive(): boolean {
        return this.cicularButton.getIsActive()
    }

    setIsActive(isActive: boolean) {
        this.cicularButton.setIsActive(isActive)
    }

    getIsClickable(): boolean {
        return this.cicularButton.getIsClickable()
    }

    setIsClickable(isClickable: boolean) {
        this.cicularButton.setIsClickable(isClickable)
    }

    getPosition(): ScreenPosition {
        return this.cicularButton.getPosition()
    }

    setPosition(newScreenPosition: ScreenPosition): void {
        this.cicularButton.setPosition(newScreenPosition)
    }

    getSize(): number {
        return this.cicularButton.getSize()
    }

    setSize(newSize: number): void {
        this.cicularButton.setSize(newSize)
    }

    getBackground(): HTMLImageElement | undefined {
        return this.cicularButton.getBackground()
    }

    setBackground(newBackground: HTMLImageElement | undefined): void {
        this.cicularButton.setBackground(newBackground)
    }

    getIcon(): HTMLImageElement | undefined {
        return this.cicularButton.getIcon()
    }

    setIcon(newIcon: HTMLImageElement | undefined): void {
        this.cicularButton.setIcon(newIcon)
    }

    wasClicked(click: ScreenPosition): boolean {
        return this.cicularButton.wasClicked(click)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onClick(_click: ScreenPosition): void {
        this.camera.setRotationAngle(0)        
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const compassCentreScreenPosition = this.cicularButton.getPosition()
        ctx.save()

        ctx.beginPath()
        ctx.arc(compassCentreScreenPosition.x, compassCentreScreenPosition.y, this.camera.baseTileSize / 2, 0, 2 * Math.PI)
        ctx.clip()

        ctx.translate(compassCentreScreenPosition.x, compassCentreScreenPosition.y)
        ctx.rotate(this.camera.rotationAngle)
        ctx.translate(-compassCentreScreenPosition.x, -compassCentreScreenPosition.y)

        this.cicularButton.draw(ctx)

        ctx.restore()
    }
}

class DrainingButton implements CombatUI {
    private getStat: () => {numerator: number, denominator: number}
    private cicularButton: CircularButton;

    constructor(isActive: boolean, isClickable: boolean, position: ScreenPosition, size: number, background: HTMLImageElement, icon: HTMLImageElement, getStatFunction: () => {numerator: number, denominator: number}) {
        this.getStat = getStatFunction
        this.cicularButton = new CircularButton(isActive, isClickable, position, size, background, icon)
    }

    getIsActive(): boolean {
        return this.cicularButton.getIsActive()
    }

    setIsActive(isActive: boolean) {
        this.cicularButton.setIsActive(isActive)
    }

    getIsClickable(): boolean {
        return this.cicularButton.getIsClickable()
    }

    setIsClickable(isClickable: boolean) {
        this.cicularButton.setIsClickable(isClickable)
    }

    getPosition(): ScreenPosition {
        return this.cicularButton.getPosition()
    }

    setPosition(newScreenPosition: ScreenPosition): void {
        this.cicularButton.setPosition(newScreenPosition)
    }

    getSize(): number {
        return this.cicularButton.getSize()
    }

    setSize(newSize: number): void {
        this.cicularButton.setSize(newSize)
    }

    getBackground(): HTMLImageElement | undefined {
        return this.cicularButton.getBackground()
    }

    setBackground(newBackground: HTMLImageElement | undefined): void {
        this.cicularButton.setBackground(newBackground)
    }

    getIcon(): HTMLImageElement | undefined {
        return this.cicularButton.getIcon()
    }

    setIcon(newIcon: HTMLImageElement | undefined): void {
        this.cicularButton.setIcon(newIcon)
    }

    wasClicked(click: ScreenPosition): boolean {
        return this.cicularButton.wasClicked(click)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onClick(_click: ScreenPosition): void {       
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const buttonPosition = this.cicularButton.getPosition()
        const buttonRadius = this.cicularButton.getSize()
        const buttonBackground = this.cicularButton.getBackground()
        const buttonIcon = this.cicularButton.getIcon()

        const data = this.getStat()
        const percentage = data.denominator != 0 ? data.numerator / data.denominator : 0

        if (buttonBackground === undefined) {
            throw new Error("buttonBackground is undefined")
        }

        if (buttonIcon === undefined) {
            throw new Error("buttonIcon is undefined")
        }

        ctx.save()

        ctx.beginPath()
        ctx.arc(buttonPosition.x, buttonPosition.y, buttonRadius, 0, 2 * Math.PI)
        ctx.clip()

        ctx.drawImage(
            buttonBackground,
            buttonPosition.x - buttonRadius,
            buttonPosition.y - buttonRadius,
            buttonRadius * 2,
            buttonRadius * 2,
        )

        ctx.fillRect(
            buttonPosition.x - buttonRadius,
            buttonPosition.y - buttonRadius,
            buttonRadius * 2,
            buttonRadius * 2 * (1 - percentage),
        )

        ctx.drawImage(
            buttonIcon,
            buttonPosition.x - buttonRadius,
            buttonPosition.y - buttonRadius,
            buttonRadius * 2,
            buttonRadius * 2,
        )

        ctx.restore()
    }
}

class ControlledUiElement implements CombatUI {
    private activeElement: CombatUI

    constructor(activeElement: CombatUI) {
        this.activeElement = activeElement
    }

    setActiveElement(element: CombatUI) {
        this.activeElement.setIsActive(false)
        this.activeElement = element
        this.activeElement.setIsActive(true)
    }

    getIsActive(): boolean {
        return this.activeElement.getIsActive()
    }

    setIsActive(isActive: boolean): void {
        this.activeElement.setIsActive(isActive)
    }

    getIsClickable(): boolean {
        return this.activeElement.getIsClickable()
    }

    setIsClickable(isClickable: boolean): void {
        this.activeElement.setIsClickable(isClickable)
    }

    getPosition(): ScreenPosition {
        return this.activeElement.getPosition()
    }

    // @TODO: this will only move the active element and not the inactive ones
    setPosition(newScreenPosition: ScreenPosition): void {
        this.activeElement.setPosition(newScreenPosition)
    }

    getSize(): Resolution | number {
        return this.activeElement.getSize()
    }

    setSize(newSize: Resolution | number): void {
        this.activeElement.setSize(newSize)
    }
    
    getBackground(): HTMLImageElement | undefined {
        return this.activeElement.getBackground()
    }

    setBackground(newBackground: HTMLImageElement | undefined): void {
        this.activeElement.setBackground(newBackground)
    }

    getIcon(): HTMLImageElement | undefined {
        return this.activeElement.getIcon()
    }

    setIcon(newIcon: HTMLImageElement | undefined): void {
        this.activeElement.setIcon(newIcon)
    }
    
    wasClicked(click: ScreenPosition): boolean {
        return this.activeElement.wasClicked(click)
    }

    onClick(click: ScreenPosition): void {
        return this.activeElement.onClick(click)
    }

    draw(ctx: CanvasRenderingContext2D): void {
        return this.activeElement.draw(ctx)
    }
}

class SquareButton implements CombatUI {
    private name: string;
    private isActive: boolean;
    private isClickable: boolean;
    private position: ScreenPosition;
    private size: Resolution;
    private squareUIElement: SquareUIElement;
    private background: HTMLImageElement;
    private icon: HTMLImageElement;
    private callbackFn: () => void;
    
    constructor(name: string, isActive: boolean, isClickable: boolean, position: ScreenPosition, size: Resolution, background: HTMLImageElement, icon: HTMLImageElement, callbackFn: () => void) {
        this.name = name
        this.isActive = isActive
        this.isClickable = isClickable
        this.position = position
        this.size = size
        this.squareUIElement = new SquareUIElement()
        this.background = background
        this.icon = icon
        this.callbackFn = callbackFn
    }

    getIsActive(): boolean {
        return this.isActive
    }

    setIsActive(isActive: boolean) {
        this.isActive = isActive
    }

    getIsClickable(): boolean {
        return this.isClickable
    }

    setIsClickable(isClickable: boolean) {
        this.isClickable = isClickable
    }

    getPosition(): ScreenPosition {
        return this.position
    }

    setPosition(newScreenPosition: ScreenPosition): void {
        this.position = newScreenPosition
    }

    getSize(): Resolution {
        return this.size
    }

    setSize(newSize: Resolution): void {
        this.size = newSize
    }

    getBackground(): HTMLImageElement {
        return this.background
    }

    setBackground(newBackground: HTMLImageElement): void {
        this.background = newBackground
    }

    getIcon(): HTMLImageElement {
        return this.icon
    }

    setIcon(newIcon: HTMLImageElement): void {
        this.icon = newIcon
    }

    wasClicked(click: ScreenPosition): boolean {
        return this.squareUIElement.wasClicked(this.getPosition(), this.getSize(), click, this.getIsActive(), this.getIsClickable())
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onClick(_click: ScreenPosition): void {
        console.log(`Clicked ${this.name}`)
        return this.callbackFn()
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.squareUIElement.draw(ctx, this.getPosition(), this.getSize(), this.getBackground(), this.getIcon())
    }
}

class RibbonButton implements CombatUI {
    private name: string;
    private _isActive: boolean;
    private _isClickable: boolean;
    private _position: ScreenPosition;
    private _size: Resolution;
    private childUIElement: CombatUI;
    private squareUIElement: SquareUIElement;
    private _background: HTMLImageElement;
    private _icon: HTMLImageElement;
    private ribbonMenuController: ControlledUiElement;
    
    constructor(name: string, isActive: boolean, isClickable: boolean, position: ScreenPosition, size: Resolution, childUIElement: CombatUI, background: HTMLImageElement, icon: HTMLImageElement, ribbonMenuController: ControlledUiElement) {
        this.name = name
        this._isActive = isActive
        this._isClickable = isClickable
        this._position = position
        this._size = size
        this.childUIElement = childUIElement
        this.squareUIElement = new SquareUIElement()
        this._background = background
        this._icon = icon
        this.ribbonMenuController = ribbonMenuController
    }

    getIsActive(): boolean {
        return this._isActive
    }

    setIsActive(isActive: boolean) {
        this._isActive = isActive
    }

    getIsClickable(): boolean {
        return this._isClickable
    }

    setIsClickable(isClickable: boolean) {
        this._isClickable = isClickable
    }

    getPosition(): ScreenPosition {
        return this._position
    }

    setPosition(newScreenPosition: ScreenPosition): void {
        this._position = newScreenPosition
    }

    getSize(): Resolution {
        return this._size
    }

    setSize(newSize: Resolution): void {
        this._size = newSize
    }

    getBackground(): HTMLImageElement {
        return this._background
    }

    setBackground(newBackground: HTMLImageElement): void {
        this._background = newBackground
    }

    getIcon(): HTMLImageElement {
        return this._icon
    }

    setIcon(newIcon: HTMLImageElement): void {
        this._icon = newIcon
    }

    wasClicked(click: ScreenPosition): boolean {
        return this.squareUIElement.wasClicked(this.getPosition(), this.getSize(), click, this.getIsActive(), this.getIsClickable())
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onClick(_click: ScreenPosition): void {
        console.log(`Clicked ${this.name}`)
        this.ribbonMenuController.setActiveElement(this.childUIElement)
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.squareUIElement.draw(ctx, this.getPosition(), this.getSize(), this.getBackground(), this.getIcon())
    }
}

class RibbonItemMenu implements CombatUI {
    private _isActive: boolean;
    private _isClickable: boolean;
    private _position: ScreenPosition;
    private _size: Resolution;
    children: CombatUI[];
    private squareUIElement: SquareUIElement;
    private _background: HTMLImageElement;
    private _icon: undefined;

    constructor(isActive: boolean, isClickable: boolean, position: ScreenPosition, size: Resolution, children: CombatUI[], background: HTMLImageElement) {
        this._isActive = isActive
        this._isClickable = isClickable
        this._position = position
        this._size = size
        this.children = children
        this.squareUIElement = new SquareUIElement()
        this._background = background
        this.offsetChildPositions(position)
    }

    offsetChildPositions(offset: ScreenPosition): void {
        for (const child of this.children) {
            const childCurrentPosition = child.getPosition()
            const childOffsetPosition = offset.add(childCurrentPosition)
            child.setPosition(childOffsetPosition)
        }
    }

    getIsActive(): boolean {
        return this._isActive
    }

    setIsActive(isActive: boolean) {
        this._isActive = isActive
    }

    getIsClickable(): boolean {
        return this._isClickable
    }

    setIsClickable(isClickable: boolean) {
        this._isClickable = isClickable
    }

    getPosition(): ScreenPosition {
        return this._position
    }

    setPosition(newScreenPosition: ScreenPosition): void {
        const difference = newScreenPosition.sub(this.getPosition())
        this._position = newScreenPosition
        this.offsetChildPositions(difference)
    }

    getSize(): Resolution {
        return this._size
    }

    setSize(newSize: Resolution): void {
        this._size = newSize
    }

    getBackground(): HTMLImageElement {
        return this._background
    }

    setBackground(newBackground: HTMLImageElement): void {
        this._background = newBackground
    }

    getIcon(): undefined {
        return undefined
    }

    setIcon(newIcon: undefined): void {
        this._icon = newIcon
    }

    wasClicked(click: ScreenPosition): boolean {
        return this.squareUIElement.wasClicked(this.getPosition(), this.getSize(), click, this.getIsActive(), this.getIsClickable())
    }

    onClick(click: ScreenPosition): void {
        for (const child of this.children) {
            if (child.wasClicked(click)) {
                child.onClick(click)
                return
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.squareUIElement.draw(ctx, this.getPosition(), this.getSize(), this.getBackground(), this.getIcon())

        for (const child of this.children) {
            child.draw(ctx)
        }
    }
}

class InventoryMenu extends RibbonItemMenu {
    private playerDataGrabber: PlayerDataGrabber

    constructor(isActive: boolean, isClickable: boolean, position: ScreenPosition, size: Resolution, background: HTMLImageElement, playerDataGrabber: PlayerDataGrabber) {
        const children: CombatUI[] = []
        super(isActive, isClickable, position, size, children, background)
        this.playerDataGrabber = playerDataGrabber
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

class EquipmentMenu extends RibbonItemMenu {
    private playerDataGrabber: PlayerDataGrabber
    private uiSlotMap: Record<EquipmentSlotKeys, {ui: CombatUI, defaultIcon: HTMLImageElement}>
    private lastKnownPlayerEquipment: PlayerEquipmentComponent

    constructor(isActive: boolean, isClickable: boolean, position: ScreenPosition, size: Resolution, background: HTMLImageElement, uiSlotMap: Record<EquipmentSlotKeys, {ui: CombatUI, defaultIcon: HTMLImageElement}>, playerDataGrabber: PlayerDataGrabber) {
        const children: CombatUI[] = [
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
        super(isActive, isClickable, position, size, children, background)
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

        if (isActive) {
            this.updateEquippedEntities()
        }
    }

    setIsActive(isActive: boolean): void {
        if (isActive) {
            this.updateEquippedEntities()
        }
        super.setIsActive(isActive)
    }

    private getPlayerEquipment(): PlayerEquipmentComponent {
        return this.playerDataGrabber.getEquipment()
    }

    updateEquippedEntities() {
        const currentPlayerEquipment = this.getPlayerEquipment()

        console.log("looping")
        Object.entries(currentPlayerEquipment).forEach(([key, value]) => {
            const currentlyEquipped = this.lastKnownPlayerEquipment[key]
            console.log(`key: ${key}, value: ${value}, current: ${currentlyEquipped}`)
            if (currentlyEquipped != value) {
                console.log("Changing icon")
                if (value === null) {
                    this.uiSlotMap[key].ui.setIcon(this.uiSlotMap[key].defaultIcon)
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

class PrayerMenu extends RibbonItemMenu {
    private playerDataGrabber: PlayerDataGrabber

    constructor(isActive: boolean, isClickable: boolean, position: ScreenPosition, size: Resolution, children: CombatUI[], background: HTMLImageElement, playerDataGrabber: PlayerDataGrabber) {
        super(isActive, isClickable, position, size, children, background)
        this.playerDataGrabber = playerDataGrabber

        if (isActive) {
            this.updateActivePrayers()
        }
    }

    setIsActive(isActive: boolean): void {
        if (isActive) {
            this.updateActivePrayers()
        }
        super.setIsActive(isActive)
    }

    updateActivePrayers() {

    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.updateActivePrayers()
        super.draw(ctx)
    }

}

const ribbonBackgroundImage = new Image()
ribbonBackgroundImage.src = "src/assets/ribbonbackground.png"

const combatIconImage = new Image()
combatIconImage.src = "src/assets/combaticon.png"

const inventoryIconImage = new Image()
inventoryIconImage.src = "src/assets/inventoryicon.png"

const equipmentIconImage = new Image()
equipmentIconImage.src = "src/assets/equipmenticon.png"

const prayerIconImage = new Image()
prayerIconImage.src = "src/assets/prayericon.png"

const spellsIconImage = new Image()
spellsIconImage.src = "src/assets/spellicon.png"

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

const staminaIconImage = new Image()
staminaIconImage.src = "src/assets/staminaicon.png"

const staminaBackgroundImage = new Image()
staminaBackgroundImage.src = "src/assets/stamina_background.png"

const headSlotBackgroundImage = new Image()
headSlotBackgroundImage.src = "src/assets/head_slot_background.png"

const emptyEquipSlot = new Image()
emptyEquipSlot.src = "src/assets/empty_equip_slot.png"

const transparentBackground = new Image()
transparentBackground.src = "src/assets/transparent_background.png"



export function createUIElements(camera: Camera, playerDataGrabber: PlayerDataGrabber): CombatUI[] {

    const getPrayerData = () => {
        const data = playerDataGrabber.getCombatUIData()
        return {numerator: data.playerCurrentPrayerPoints, denominator: data.playerMaxPrayerPoints}
    }

    const getHealthData = () => {
        const data = playerDataGrabber.getCombatUIData()
        return {numerator: data.playerCurrentHealth, denominator: data.playerMaxHealth}
    }

    const getSpecialAttackData = () => {
        const data = playerDataGrabber.getCombatUIData()
        return {numerator: data.playerCurrentSpecialAttack, denominator: data.playerMaxSpecialAttack}
    }

    const getStaminaData = () => {
        const data = playerDataGrabber.getCombatUIData()
        return {numerator: data.playerCurrentStamina, denominator: data.playerMaxStamina}
    }

    const compass = new CompassButton(true, true, new ScreenPosition(camera.resolution.width * 0.9, camera.resolution.height * 0.1), 32, compassImage, camera)
    const prayer = new DrainingButton(true, false, new ScreenPosition(camera.resolution.width * 0.8, camera.resolution.height * 0.1), 32, prayerBackgroundImage, prayerIconImage, () => getPrayerData())
    const health = new DrainingButton(true, false, new ScreenPosition(camera.resolution.width * 0.7, camera.resolution.height * 0.1), 32, healthBackgroundImage, healthIconImage, () => getHealthData())
    const specialAttack = new DrainingButton(true, false, new ScreenPosition(camera.resolution.width * 0.6, camera.resolution.height * 0.1), 32, specialAttackBackgroundImage, combatIconImage, () => getSpecialAttackData())
    const stamina = new DrainingButton(true, false, new ScreenPosition(camera.resolution.width * 0.5, camera.resolution.height * 0.1), 32, staminaBackgroundImage, staminaIconImage, () => getStaminaData())

    // Ribbon group
    const ribbonGroupScreenPosition = {x: camera.resolution.width * 0.75, y: camera.resolution.height * 0.65}
    const ribbonButtonDimensions = {width: camera.resolution.width * 0.05, height: camera.resolution.height * 0.05}
    const ribbonMenuDimensions = {width: camera.resolution.width * 0.25, height: camera.resolution.height * 0.25}
    
    
    const combatMenu = new RibbonItemMenu(
        false,
        true,
        new ScreenPosition(ribbonGroupScreenPosition.x, ribbonGroupScreenPosition.y + ribbonButtonDimensions.height),
        ribbonMenuDimensions,
        [],
        ribbonBackgroundImage
    )
    
    const ribbonMenuController = new ControlledUiElement(combatMenu)

    const combatButton = new RibbonButton(
        "Combat Menu Button",
        true,
        true,
        new ScreenPosition(ribbonGroupScreenPosition.x, ribbonGroupScreenPosition.y),
        ribbonButtonDimensions,
        combatMenu,
        ribbonBackgroundImage,
        combatIconImage,
        ribbonMenuController,
    )


    // Inventory
    const inventoryMenu = new InventoryMenu(
        true,
        true,
        new ScreenPosition(ribbonGroupScreenPosition.x, ribbonGroupScreenPosition.y + ribbonButtonDimensions.height),
        ribbonMenuDimensions,
        ribbonBackgroundImage,
        playerDataGrabber,
    )

    const inventoryButton = new RibbonButton(
        "Inventory Menu Button",
        true,
        true,
        new ScreenPosition(ribbonGroupScreenPosition.x + ribbonButtonDimensions.width, ribbonGroupScreenPosition.y),
        ribbonButtonDimensions,
        inventoryMenu,
        ribbonBackgroundImage,
        inventoryIconImage,
        ribbonMenuController,
    )


    // Equipment
    const headSlot = new SquareButton(
        "headSlot",
        true,
        true,
        new ScreenPosition(100, 0),
        ribbonButtonDimensions,
        transparentBackground,
        emptyEquipSlot,
        () => {
            playerDataGrabber.inputQueue.queueUnequip(EquipmentSlots.Head)
        },
    )

    const capeSlot = new SquareButton(
        "capeSlot",
        true,
        true,
        new ScreenPosition(40, 55),
        ribbonButtonDimensions,
        transparentBackground,
        emptyEquipSlot,
        () => {
            playerDataGrabber.inputQueue.queueUnequip(EquipmentSlots.Cape)
        },
    )

    const neckSlot = new SquareButton(
        "neckSlot",
        true,
        true,
        new ScreenPosition(100, 55),
        ribbonButtonDimensions,
        transparentBackground,
        emptyEquipSlot,
        () => {
            playerDataGrabber.inputQueue.queueUnequip(EquipmentSlots.Neck)
        },
    )

    const ammoSlot = new SquareButton(
        "ammoSlot",
        true,
        true,
        new ScreenPosition(160, 55),
        ribbonButtonDimensions,
        transparentBackground,
        emptyEquipSlot,
        () => {
            playerDataGrabber.inputQueue.queueUnequip(EquipmentSlots.Ammo)
        },
    )

    const mainHandSlot = new SquareButton(
        "mainHandSlot",
        true,
        true,
        new ScreenPosition(30, 110),
        ribbonButtonDimensions,
        transparentBackground,
        emptyEquipSlot,
        () => {
            playerDataGrabber.inputQueue.queueUnequip(EquipmentSlots.MainHand)
        },
    )

    const chestSlot = new SquareButton(
        "chestSlot",
        true,
        true,
        new ScreenPosition(100, 110),
        ribbonButtonDimensions,
        transparentBackground,
        emptyEquipSlot,
        () => {
            playerDataGrabber.inputQueue.queueUnequip(EquipmentSlots.Chest)
        },
    )

    const offHandSlot = new SquareButton(
        "offHandSlot",
        true,
        true,
        new ScreenPosition(170, 110),
        ribbonButtonDimensions,
        transparentBackground,
        emptyEquipSlot,
        () => {
            playerDataGrabber.inputQueue.queueUnequip(EquipmentSlots.OffHand)
        },
    )

    const legsSlot = new SquareButton(
        "legsSlot",
        true,
        true,
        new ScreenPosition(100, 165),
        ribbonButtonDimensions,
        transparentBackground,
        emptyEquipSlot,
        () => {
            playerDataGrabber.inputQueue.queueUnequip(EquipmentSlots.Legs)
        },
    )

    const glovesSlot = new SquareButton(
        "glovesSlot",
        true,
        true,
        new ScreenPosition(30, 220),
        ribbonButtonDimensions,
        transparentBackground,
        emptyEquipSlot,
        () => {
            playerDataGrabber.inputQueue.queueUnequip(EquipmentSlots.Gloves)
        },
    )

    const bootsSlot = new SquareButton(
        "bootsSlot",
        true,
        true,
        new ScreenPosition(100, 220),
        ribbonButtonDimensions,
        transparentBackground,
        emptyEquipSlot,
        () => {
            playerDataGrabber.inputQueue.queueUnequip(EquipmentSlots.Boots)
        },
    )

    const ringSlot = new SquareButton(
        "ringSlot",
        true,
        true,
        new ScreenPosition(170, 220),
        ribbonButtonDimensions,
        transparentBackground,
        emptyEquipSlot,
        () => {
            playerDataGrabber.inputQueue.queueUnequip(EquipmentSlots.Ring)
        },
    )

    const equipmentMenu = new EquipmentMenu(
        false,
        true,
        new ScreenPosition(ribbonGroupScreenPosition.x, ribbonGroupScreenPosition.y + ribbonButtonDimensions.height),
        ribbonMenuDimensions,
        ribbonBackgroundImage,
        {
            head: {ui: headSlot, defaultIcon: emptyEquipSlot},
            cape: {ui: capeSlot, defaultIcon: emptyEquipSlot},
            neck: {ui: neckSlot, defaultIcon: emptyEquipSlot},
            ammo: {ui: ammoSlot, defaultIcon: emptyEquipSlot},
            mainHand: {ui: mainHandSlot, defaultIcon: emptyEquipSlot},
            chest: {ui: chestSlot, defaultIcon: emptyEquipSlot},
            offHand: {ui: offHandSlot, defaultIcon: emptyEquipSlot},
            legs: {ui: legsSlot, defaultIcon: emptyEquipSlot},
            gloves: {ui: glovesSlot, defaultIcon: emptyEquipSlot},
            boots: {ui: bootsSlot, defaultIcon: emptyEquipSlot},
            ring: {ui: ringSlot, defaultIcon: emptyEquipSlot},
        },
        playerDataGrabber,
    )

    const equipmentButton = new RibbonButton(
        "Equipment Menu Button",
        true,
        true,
        new ScreenPosition(ribbonGroupScreenPosition.x + ribbonButtonDimensions.width * 2, ribbonGroupScreenPosition.y),
        ribbonButtonDimensions,
        equipmentMenu,
        ribbonBackgroundImage,
        equipmentIconImage,
        ribbonMenuController,
    )

    // Prayer
    const protectFromMagic = new SquareButton(
        "protectFromMagic",
        true,
        true,
        new ScreenPosition(30, 100),
        ribbonButtonDimensions,
        transparentBackground,
        protectFromMagicIcon,
        () => {
            playerDataGrabber.inputQueue.queuePrayerChange({prayer: Prayers.ProtectMage})
        },
    )

    const protectFromRanged = new SquareButton(
        "protectFromRanged",
        true,
        true,
        new ScreenPosition(100, 100),
        ribbonButtonDimensions,
        transparentBackground,
        protectFromRangedIcon,
        () => {
            playerDataGrabber.inputQueue.queuePrayerChange({prayer: Prayers.ProtectRange})
        },
    )

    const protectFromMelee = new SquareButton(
        "protectFromMelee",
        true,
        true,
        new ScreenPosition(170, 100),
        ribbonButtonDimensions,
        transparentBackground,
        protectFromMeleeIcon,
        () => {
            playerDataGrabber.inputQueue.queuePrayerChange({prayer: Prayers.ProtectMelee})
        },
    )

    const prayerMenu = new PrayerMenu(
        false,
        true,
        new ScreenPosition(ribbonGroupScreenPosition.x, ribbonGroupScreenPosition.y + ribbonButtonDimensions.height),
        ribbonMenuDimensions,
        [
            protectFromMagic,
            protectFromRanged,
            protectFromMelee,
        ],
        ribbonBackgroundImage,
        playerDataGrabber,
    )

    const prayerButton = new RibbonButton(
        "Prayer Menu Button",
        true,
        true,
        new ScreenPosition(ribbonGroupScreenPosition.x + ribbonButtonDimensions.width * 3, ribbonGroupScreenPosition.y),
        ribbonButtonDimensions,
        prayerMenu,
        ribbonBackgroundImage,
        prayerIconImage,
        ribbonMenuController,
    )


    const spellsMenu = new RibbonItemMenu(
        false,
        true,
        new ScreenPosition(ribbonGroupScreenPosition.x, ribbonGroupScreenPosition.y + ribbonButtonDimensions.height),
        ribbonMenuDimensions,
        [],
        ribbonBackgroundImage
    )

    const spellsButton = new RibbonButton(
        "Spells Menu Button",
        true,
        true,
        new ScreenPosition(ribbonGroupScreenPosition.x + ribbonButtonDimensions.width * 4, ribbonGroupScreenPosition.y),
        ribbonButtonDimensions,
        spellsMenu,
        ribbonBackgroundImage,
        spellsIconImage,
        ribbonMenuController,
    )

    ribbonMenuController.setActiveElement(inventoryMenu)

    return [
        compass,
        prayer,
        health,
        specialAttack,
        stamina,

        combatButton,
        inventoryButton,
        equipmentButton,
        prayerButton,
        spellsButton,

        ribbonMenuController,
    ]
}