import { Camera } from "./camera";
import { CombatInputQueue } from "./combat_input_queue";
import { Coordinator } from "./ecs";
import { type TransformComponent, type StaminaComponent, type MovementComponent, type ModelComponent, type HealthComponent, type DamageReceiverComponent, type HitSplatComponent, type SimpleBehaviourComponent, type OffsensiveStatsComponent, type HomingProjectileComponent, type InventoryComponent, type ItemDetailsComponent, type PlayerEquipmentComponent, type PrayerComponent, type DefensiveStatsComponent, type AttackCommandComponent, type PathingComponent, type PlayerComponent } from "./ecs_components";
import { ModelRenderSystem, HitSplatRenderSystem, HealthBarRenderSystem, PrayerRenderSystem } from "./ecs_render_systems";
import { StaminaSystem, MovementSystem, AnimationSystem, DamageReceiverSystem, SimpleBehaviourSystem, HomingProjectileSystem, InventorySystem, PlayerEquipmentSystem, PrayerSystem, AttackCooldownSystem, AttackCommandSystem } from "./ecs_systems";
import { type Entity, ComponentTypes } from "./ecs_types";
import { TILE_SIZE_PIXELS, TICK_RATE_MS, MOUSE_SENSITIVITY, ITEMS, BASE_WIDTH, BASE_HEIGHT } from "./globals";
import { WaveTestInstance, type Instance } from "./instance";
import { createItem } from "./item_options";
import { createNewUIElements } from "./new_combat_ui";
import { pathingBFS } from "./pathing";
import { ScreenPosition, WorldPosition } from "./position";
import { TileMap, } from "./tile_maps";
import { UiEngineCommunicator } from "./ui_engine_communicator";
import { UiManager } from "./ui_manager";
import { createPlayer, npcWasClicked } from "./utilities";

export class CombatEngine {
    private canvas: HTMLCanvasElement;
    private canvasParent: HTMLDivElement;
    private parentWidth: number;
    private parentHeight: number;
    private ctx: CanvasRenderingContext2D;
    private camera: Camera;
    private inputQueue: CombatInputQueue;
    private running: boolean;
    private lastTime = 0;
    private timeSinceLastTick = 0;
    private frameCount = 0;
    uiManager: UiManager;
    private player: Entity;
    private playerCurentRawInput: RawInput;
    private playerPreviousRawInput: RawInput;
    npcs: Entity[]
    tileBlockCount: number[]

    private currentWidth: number
    private currentHeight: number
    private currentScale: number
    
    currentTileMap!: TileMap;
    coordinator: Coordinator;

    // Systems
   staminaSystem: StaminaSystem
   movementSystem: MovementSystem
   animationSystem: AnimationSystem
   damageReceiverSystem: DamageReceiverSystem
   simpleBehaviourSystem: SimpleBehaviourSystem
   homingProjectileSystem: HomingProjectileSystem
   inventorySystem: InventorySystem
   playerEquipmentSystem: PlayerEquipmentSystem
   prayerSystem: PrayerSystem
   attackCooldownSystem: AttackCooldownSystem
   attackCommandSystem: AttackCommandSystem

    // Render systems
    private renderSystem: ModelRenderSystem
    private hitSplatRenderSystem: HitSplatRenderSystem
    private healthBarRenderSystem: HealthBarRenderSystem
    private prayerRenderSystem: PrayerRenderSystem
    
    private uiEngineCommunicator: UiEngineCommunicator

    private combatInstance: Instance
    
    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, canvasParent: HTMLDivElement) {
        this.canvas = canvas
        this.ctx = ctx
        this.canvasParent = canvasParent
        const parentRect = canvasParent.getBoundingClientRect()
        this.parentWidth = parentRect.width
        this.parentHeight = parentRect.height

        this.currentWidth = BASE_WIDTH
        this.currentHeight = BASE_HEIGHT
        this.currentScale = window.devicePixelRatio

        this.uiManager = new UiManager(BASE_WIDTH, BASE_HEIGHT)
        
        const canvasBoundingClientRect = canvas.getBoundingClientRect()        
        this.camera = new Camera({width: canvasBoundingClientRect.width, height: canvasBoundingClientRect.height}, TILE_SIZE_PIXELS)
        // this.camera = new Camera({width: 2048, height: 2048}, TILE_SIZE_PIXELS)

        const mediaQueryString = `(resolution: ${window.devicePixelRatio}dppx)`
        const media = matchMedia(mediaQueryString)

        this.resize()
        media.addEventListener("change", () => {
            this.resize()
        })
        window.addEventListener("resize", () => {
            this.resize()
        })


        this.running = false

        
        // this.currentTileMap = testCaveTileMap
        
        this.playerCurentRawInput = {
            mousePositionX: 0,
            mousePositionY: 0,
            mouseWheelXChange: 0,
            mouseWheelYChange: 0,
            mouseOneIsDown: false,
            mouseTwoIsDown: false,
            mouseThreeIsDown: false,
        }
        
        this.playerPreviousRawInput = {
            mousePositionX: 0,
            mousePositionY: 0,
            mouseWheelXChange: 0,
            mouseWheelYChange: 0,
            mouseOneIsDown: false,
            mouseTwoIsDown: false,
            mouseThreeIsDown: false,
        }

        this.npcs = []
        this.tileBlockCount = []
        this.currentTileMap = null

        // ECS
        this.coordinator = new Coordinator(this.ctx, this.camera, this.currentTileMap, this)

        this.combatInstance = new WaveTestInstance(this)
        
        
        this.coordinator.registerComponent<TransformComponent>(ComponentTypes.Transform)
        this.coordinator.registerComponent<StaminaComponent>(ComponentTypes.Stamina)
        this.coordinator.registerComponent<MovementComponent>(ComponentTypes.Movement)
        this.coordinator.registerComponent<ModelComponent>(ComponentTypes.Model)
        this.coordinator.registerComponent<HealthComponent>(ComponentTypes.Health)
        this.coordinator.registerComponent<DamageReceiverComponent>(ComponentTypes.DamageReceiver)
        this.coordinator.registerComponent<HitSplatComponent>(ComponentTypes.HitSplat)
        this.coordinator.registerComponent<SimpleBehaviourComponent>(ComponentTypes.SimpleBehaviour)
        this.coordinator.registerComponent<OffsensiveStatsComponent>(ComponentTypes.OffensiveStats)
        this.coordinator.registerComponent<DefensiveStatsComponent>(ComponentTypes.DefensiveStats)
        this.coordinator.registerComponent<HomingProjectileComponent>(ComponentTypes.HomingProjectile)
        this.coordinator.registerComponent<InventoryComponent>(ComponentTypes.Inventory)
        this.coordinator.registerComponent<ItemDetailsComponent>(ComponentTypes.ItemDetails)
        this.coordinator.registerComponent<PlayerEquipmentComponent>(ComponentTypes.PlayerEquipment)
        this.coordinator.registerComponent<PrayerComponent>(ComponentTypes.Prayer)
        this.coordinator.registerComponent<AttackCommandComponent>(ComponentTypes.AttackCommand)
        this.coordinator.registerComponent<PathingComponent>(ComponentTypes.Pathing)
        this.coordinator.registerComponent<PlayerComponent>(ComponentTypes.Player)
        
        this.staminaSystem = new StaminaSystem(this.coordinator)
        this.movementSystem = new MovementSystem(this.coordinator)
        this.animationSystem = new AnimationSystem(this.coordinator)
        this.damageReceiverSystem = new DamageReceiverSystem(this.coordinator)
        this.simpleBehaviourSystem = new SimpleBehaviourSystem(this.coordinator)
        this.homingProjectileSystem = new HomingProjectileSystem(this.coordinator)
        this.inventorySystem = new InventorySystem(this.coordinator)
        this.playerEquipmentSystem = new PlayerEquipmentSystem(this.coordinator)
        this.prayerSystem = new PrayerSystem(this.coordinator)
        this.attackCooldownSystem = new AttackCooldownSystem(this.coordinator)
        this.attackCommandSystem = new AttackCommandSystem(this.coordinator)
        
        this.renderSystem = new ModelRenderSystem(this.coordinator)
        this.hitSplatRenderSystem = new HitSplatRenderSystem(this.coordinator)
        this.healthBarRenderSystem = new HealthBarRenderSystem(this.coordinator)
        this.prayerRenderSystem = new PrayerRenderSystem(this.coordinator)

        // Player
        this.player = createPlayer(this.coordinator)
        this.inputQueue = new CombatInputQueue(this.coordinator)
        this.uiEngineCommunicator = new UiEngineCommunicator(this.coordinator, this, this.player, this.inputQueue)

        const twistedBow = createItem(this.coordinator, ITEMS.TwistedBow)
        const fortifiedMasoriBody = createItem(this.coordinator, ITEMS.FortifiedMasoriBody)
        const fortifiedMasoriChaps = createItem(this.coordinator, ITEMS.FortifiedMasoriChaps)
        const healthPotion = createItem(this.coordinator, ITEMS.HealthPotionFourDose)
        const prayerPotion = createItem(this.coordinator, ITEMS.PrayerPotionFourDose)
        const healthPotionFirstTwoDose = createItem(this.coordinator, ITEMS.HealthPotionTwoDose)
        const healthPotionSecondTwoDose = createItem(this.coordinator, ITEMS.HealthPotionTwoDose)
        const playerInventory = this.coordinator.getComponent<InventoryComponent>(this.player, ComponentTypes.Inventory)
        playerInventory.slots[0] = twistedBow
        playerInventory.slots[1] = fortifiedMasoriBody
        playerInventory.slots[2] = fortifiedMasoriChaps
        playerInventory.slots[3] = healthPotion
        playerInventory.slots[4] = prayerPotion
        playerInventory.slots[5] = healthPotionFirstTwoDose
        playerInventory.slots[6] = healthPotionSecondTwoDose
       
        for (const element of createNewUIElements(this.uiEngineCommunicator, this.camera)) {
            this.uiManager.addUiElement(element)
        }
        
    }

    resize() {
        console.log("RESIZING")
        const devicePixelRatio = window.devicePixelRatio
        // this.canvas.style.width = `${BASE_WIDTH}px`
        // this.canvas.style.height = `${BASE_HEIGHT}px`
        this.canvas.style.width = "100%"
        this.canvas.style.height = "100%"
        const canvasBoundingClientRect = this.canvas.getBoundingClientRect()
        this.canvas.width = Math.round(devicePixelRatio * canvasBoundingClientRect.right) - Math.round(devicePixelRatio * canvasBoundingClientRect.left)
        this.canvas.height = Math.round(devicePixelRatio * canvasBoundingClientRect.bottom) - Math.round(devicePixelRatio * canvasBoundingClientRect.top)
        this.camera.baseTileSize = TILE_SIZE_PIXELS * devicePixelRatio
        this.camera.tileSize = this.camera.zoomLevel * TILE_SIZE_PIXELS * devicePixelRatio

        console.log(`canvasWidth: ${this.canvas.width}`)
        console.log(`canvasHeight: ${this.canvas.height}`)

        console.log(this.camera.baseTileSize)

        // this.uiManager.resize(this.canvas.width, this.canvas.height)
        this.uiManager.resize(this.parentWidth, this.parentHeight)
        
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(devicePixelRatio, devicePixelRatio)

        // this.camera.setResolution({
        //         width: canvasBoundingClientRect.width * this.currentScale, 
        //         height: canvasBoundingClientRect.height * this.currentScale,
        //     })

        // const scaleX = this.currentWidth / this.baseWidth
        // const scaleY = this.currentHeight / this.baseHeight
        // const scale = Math.min(scaleX, scaleY)
    }

    start() {
        this.running = true
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop);
    }

    stop() {
        this.running = false
    }

    getCoordinator() {
        return this.coordinator
    }

    canPath(targetTile: WorldPosition): boolean {
        const tileIndex = targetTile.y * this.currentTileMap.cols + targetTile.x
        if (!this.currentTileMap.canPath(this.currentTileMap.getTile(targetTile.x, targetTile.y))) {
            return false
        }

        if (this.tileBlockCount[tileIndex] > 0) {
            return false
        }

        return true
    }

    // canPath(sourceTransformComponent: TransformComponent, targetTile: WorldPosition): boolean {
    //     const currentTiles = getAllTiles(sourceTransformComponent)
    //     const movedTransformComponent = {
    //         ...sourceTransformComponent
    //     }
    //     movedTransformComponent.actualNorthWestPosition = targetTile

    //     const targetTiles = getAllTiles(movedTransformComponent)

    //     // Remove tiles already standing on
    //     for (let i = targetTiles.length - 1; i >= 0; i--) {
    //         for (const tile of currentTiles) {
    //             if (tile.equals(targetTiles[i])) {
    //                 targetTiles.splice(i, 1)
    //                 break
    //             }
    //         }
    //     }

    //     for (const tile of targetTiles) {
    //         if (!this.currentTileMap.canPath(this.currentTileMap.getTile(tile.x, tile.y))) {
    //             return false
    //         }

    //         const tileIndex = tile.y * this.currentTileMap.cols + tile.x
    //         if (this.tileBlockCount[tileIndex] > 0) {
    //             return false
    //         }
    //     }

    //     return true
    // }

    setTileMap(newTileMap: TileMap) {
        this.currentTileMap = newTileMap
        this.coordinator.tileMap = this.currentTileMap
        this.tileBlockCount = Array(newTileMap.cols * newTileMap.rows).fill(0)
    }

    private gameLoop = (timestamp: number) => {
        // @TODO: is there a more efficient way to check for resize?
        // Maybe use a ref?
        const parentRect = this.canvasParent.getBoundingClientRect()
        const parentWidth = parentRect.width
        const parentHeight = parentRect.height
        if (this.parentWidth != parentWidth || this.parentHeight != parentHeight) {
            this.parentHeight = parentRect.height
            this.parentWidth = parentRect.width
            this.resize()
        }

        const deltaTimeMs= timestamp - this.lastTime
        this.lastTime = timestamp
        this.timeSinceLastTick += deltaTimeMs
        if(this.timeSinceLastTick > TICK_RATE_MS) {
            this.tick()
            this.timeSinceLastTick -= TICK_RATE_MS
        } 
        
        this.frameCount++
        this.update(deltaTimeMs)
        this.render(deltaTimeMs)

        if (this.running) {
            requestAnimationFrame(this.gameLoop);
        }
    }
    
    private tick() {
        for (const prayer of this.inputQueue.stackedPrayerChange) {
            this.prayerSystem.changePrayer(this.player, prayer.prayer)
        }
        this.inputQueue.clearPrayerChange()
        for (const unequip of this.inputQueue.stackedUnequip) {
            this.playerEquipmentSystem.tryToUnEquip(this.player, unequip.slot)
        }
        this.inputQueue.clearUnequip()
        for (const equipChange of this.inputQueue.stackedEquipmentChange) {
            this.playerEquipmentSystem.tryToEquip(this.player, equipChange.itemEntityToEquip)
        }
        this.inputQueue.clearEquipmentChange()
        if (this.inputQueue.queuedConsumable !== null) {
            const consumeData = this.inputQueue.queuedConsumable
            this.inventorySystem.consumeItem(this.player, consumeData.itemEntity, consumeData.invetoryPosition, consumeData.consumeFunction)
            this.inputQueue.clearConsumeItem()
        }

        const attackData = this.inputQueue.queuedAttack 
        if (attackData !== null) {
            // @TODO: check if the component exists, if it does change it
            try {
                this.coordinator.removeComponent(this.player, ComponentTypes.AttackCommand)
            } catch (e) {
                console.error(`attackCommandComponent did not exist on player: ${e}`)
            }
            this.coordinator.addComponent<AttackCommandComponent>(this.player, ComponentTypes.AttackCommand, {target: attackData.target})
            this.inputQueue.clearAttack()
        }
        
        
        this.staminaSystem.tick()
        this.movementSystem.tick()
        this.animationSystem.tick()
        this.damageReceiverSystem.tick()
        this.simpleBehaviourSystem.tick()
        this.homingProjectileSystem.tick()
        this.attackCooldownSystem.tick()
        this.attackCommandSystem.tick()

        this.uiEngineCommunicator.tick()

        this.renderSystem.tick()

        this.combatInstance.tick()

        // Check nps deaths
        for (let i = this.npcs.length - 1; i >= 0; i--) {
            const npcEntity = this.npcs[i]
            const healthComponent = this.coordinator.getComponent<HealthComponent>(npcEntity, ComponentTypes.Health)
            if (healthComponent.currentHealth <= 0) {
                this.npcs.splice(i, 1)
                this.coordinator.destroyEntity(npcEntity)
            }
        }
    }

    private update(deltaTimeMs: number) {
        this.handleInput()

        this.staminaSystem.update(deltaTimeMs)
        this.movementSystem.update(deltaTimeMs)
        this.animationSystem.update(deltaTimeMs)
        this.damageReceiverSystem.update(deltaTimeMs)
        this.simpleBehaviourSystem.update(deltaTimeMs)
        this.homingProjectileSystem.update(deltaTimeMs)

        this.updateCamera()
    }

    private drawUI(): void {
        this.uiManager.draw(this.ctx)
    }

    private updateCamera() {
        const playerTransformComponent = this.coordinator.getComponent<TransformComponent>(this.player, ComponentTypes.Transform)
        const target = playerTransformComponent.renderNorthWestPosition
        
        const delta = target.sub(this.camera.getWorldPosition())

        const lerpFactor = 0.1
        const minimumMove = 0.001

        if (this.camera.getWorldPosition().x != target.x) {
            if (Math.abs(delta.x) < minimumMove) {
                this.camera.setWorldPosition(new WorldPosition(target.x, this.camera.getWorldPosition().y))
            } else {
                const diff = new WorldPosition(delta.x * lerpFactor, 0)
                this.camera.setWorldPosition(this.camera.getWorldPosition().add(diff))
            }
        }

        if (this.camera.getWorldPosition().y != target.y) {
            if (Math.abs(delta.y) < minimumMove) {
                this.camera.setWorldPosition(new WorldPosition(this.camera.getWorldPosition().x, target.y))
            } else {
                const diff = new WorldPosition(0, delta.y * lerpFactor)
                this.camera.setWorldPosition(this.camera.getWorldPosition().add(diff))
            }
        }
    }

    private render(deltaTimeMs: number) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        
        // Draw things rotated around the centre of the screen
        this.ctx.save()
        const screenCentre = this.camera.getScreenCentre()
        this.ctx.translate(screenCentre.x, screenCentre.y)
        this.ctx.rotate(this.camera.rotationAngle)
        this.ctx.translate(-screenCentre.x, -screenCentre.y)
        
        this.drawTileMap(this.currentTileMap)
        this.renderSystem.update(deltaTimeMs)

        this.hitSplatRenderSystem.update(deltaTimeMs)
        this.prayerRenderSystem.update(deltaTimeMs)
        this.healthBarRenderSystem.update(deltaTimeMs)

        this.ctx.restore()

        // Dont rotate with camera
        this.ctx.save()

        this.ctx.restore()

        this.drawUI()
    }

    blockTiles(tiles: WorldPosition[]) {
        for (const tile of tiles) {
            const index = tile.y * this.currentTileMap.cols +  tile.x
            this.tileBlockCount[index] += 1
        }
    }

    unblockTiles(tiles: WorldPosition[]) {
        for (const tile of tiles) {
            const index = tile.y * this.currentTileMap.cols +  tile.x
            this.tileBlockCount[index] -= 1
        }
    }
    
    drawTileMap(tileMap: TileMap): void {
        const tileMapImage = new Image()
        tileMapImage.src = tileMap.source
        
        const bounds = this.camera.getRenderBounds()
        const drawTileGrid = true
        
        for (let x = 0; x <= (bounds.bottomRight.x - bounds.topLeft.x); x++) {
            for (let y = 0; y <= (bounds.bottomRight.y - bounds.topLeft.y); y++) {
                const tile = tileMap.getTile(bounds.topLeft.x + x, bounds.topLeft.y + y)
                if (tile !== 0) {
                    this.ctx.drawImage(
                        tileMapImage,
                        (tile - 1) * tileMap.tileSize,
                        0,
                        tileMap.tileSize,
                        tileMap.tileSize,
                        bounds.topLeftScreenPosition.x + x * this.camera.tileSize,
                        bounds.topLeftScreenPosition.y + y * this.camera.tileSize,
                        this.camera.tileSize,
                        this.camera.tileSize,
                    )
                    
                    if (drawTileGrid) {
                        this.ctx.strokeRect(
                            bounds.topLeftScreenPosition.x + x * this.camera.tileSize,
                            bounds.topLeftScreenPosition.y + y * this.camera.tileSize,
                            this.camera.tileSize,
                            this.camera.tileSize,
                        )
                    }
                }
            }
        }
    }

    onMouseDown(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        switch (event.button) {
            case 0:
                this.playerCurentRawInput.mouseOneIsDown = true
                break
            case 1:
                this.playerCurentRawInput.mouseTwoIsDown = true
                break
            case 2:
                this.playerCurentRawInput.mouseThreeIsDown = true
                break
            default:
                break
        }
    }

    onMouseUp(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        switch (event.button) {
            case 0:
                this.playerCurentRawInput.mouseOneIsDown = false
                break
            case 1:
                this.playerCurentRawInput.mouseTwoIsDown = false
                break
            case 2:
                this.playerCurentRawInput.mouseThreeIsDown = false
                break
            default:
                break
        }
    }

    onMouseMove(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        this.playerCurentRawInput.mousePositionX = event.clientX
        this.playerCurentRawInput.mousePositionY = event.clientY
    }

    onScroll(event: React.WheelEvent<HTMLCanvasElement>) {
        this.playerCurentRawInput.mouseWheelYChange += event.deltaY
        this.playerCurentRawInput.mouseWheelXChange += event.deltaX
    }

    handleInput() {
        // @TODO: early returns will result in ignoring multiple inputs
        // @TODO: a press and release in the same frame will result in no input, should maybe use a stack
        const currentInput = {
            ...this.playerCurentRawInput
        }

        const previousInput = {
            ...this.playerPreviousRawInput
        }

        this.playerPreviousRawInput = currentInput

        const canvasBoundingClientRect = this.canvas.getBoundingClientRect()
        const mouseXCanvasPosition = currentInput.mousePositionX - canvasBoundingClientRect.x
        const mouseYCanvasPosition = currentInput.mousePositionY - canvasBoundingClientRect.y

        // console.log(`Mouse position: ${mouseXCanvasPosition},${mouseYCanvasPosition}`)

        let mouseMoved = false
        if (currentInput.mousePositionX != previousInput.mousePositionX || currentInput.mousePositionY != previousInput.mousePositionY) {
            mouseMoved = true
        }

        const processedInput: ProcessedInput = {
            mouseMoved: mouseMoved,

            mouseXCanvasPosition: mouseXCanvasPosition,
            mouseYCanvasPosition: mouseYCanvasPosition,

            mouseWheelXChange: currentInput.mouseWheelXChange,
            mouseWheelYChange: currentInput.mouseWheelYChange,

            mouseOneIsDown: currentInput.mouseOneIsDown,
            mouseOnePressed: currentInput.mouseOneIsDown && !previousInput.mouseOneIsDown,
            mouseOneReleased: !currentInput.mouseOneIsDown && previousInput.mouseOneIsDown,

            mouseTwoIsDown: currentInput.mouseTwoIsDown,
            mouseTwoPressed: currentInput.mouseTwoIsDown && !previousInput.mouseTwoIsDown,
            mouseTwoReleased: !currentInput.mouseTwoIsDown && previousInput.mouseTwoIsDown,

            mouseThreeIsDown: currentInput.mouseThreeIsDown,
            mouseThreePressed: currentInput.mouseThreeIsDown && !previousInput.mouseThreeIsDown,
            mouseThreeReleased: !currentInput.mouseThreeIsDown && previousInput.mouseThreeIsDown,
        }

        // Check for UI clicks first
        const uiWasClicked = this.uiManager.baseUiGroup.handleMouseInput(processedInput)

        if (uiWasClicked) {
            this.uiManager.baseUiGroup.shouldHaltInteraction = false
            console.log("UI CLICK")
            return
        }

        if (currentInput.mouseOneIsDown && !previousInput.mouseOneIsDown) {
            const clickScreenPosition = new ScreenPosition(mouseXCanvasPosition, mouseYCanvasPosition)

            const inter = this.camera.screenToWorld(clickScreenPosition)
            const clickWorldPosition = this.camera.roundWorldToTile(inter)

            // Check for NPC clicks
            for (const npc of this.npcs) {
                const transformComponent = this.coordinator.getComponent<TransformComponent>(npc, ComponentTypes.Transform)
                if (npcWasClicked(transformComponent, clickWorldPosition)) {
                    console.log("NPC CLICK")
                    this.inputQueue.queueAttack({target: npc})
                    return
                }
            }

            try {
                this.coordinator.removeComponent(this.player, ComponentTypes.AttackCommand)
            } catch (e) {
                console.error(`tried to remove attackCommandComponent during player move but it does not exist: ${e}`)
            }
            const transformComponent = this.coordinator.getComponent<TransformComponent>(this.player, ComponentTypes.Transform)
            const movementComponent = this.coordinator.getComponent<MovementComponent>(this.player, ComponentTypes.Movement)
            movementComponent.movementPath = pathingBFS(transformComponent.actualNorthWestPosition, clickWorldPosition, this)


        } else if (currentInput.mouseTwoIsDown) {
            // Rotate camera
            console.log("M2")
            const screenCentre = this.camera.getScreenCentre()

            const previousX = previousInput.mousePositionX - canvasBoundingClientRect.x - screenCentre.x
            const previousY = previousInput.mousePositionY - canvasBoundingClientRect.y - screenCentre.y
            const previousGradient = previousX == 0 ? 100 * previousY : previousY / previousX

            const newX = currentInput.mousePositionX - canvasBoundingClientRect.x - screenCentre.x
            const newY = currentInput.mousePositionY - canvasBoundingClientRect.y - screenCentre.y
            const newGradient = newX == 0 ? 100 * newY : newY / newX

            let denominator = 1 + newGradient * previousGradient
            if (denominator == 0) {
                denominator += 0.01
            }
            const deltaTheta = Math.atan((newGradient - previousGradient) / denominator) * MOUSE_SENSITIVITY

            this.camera.setRotationAngle(this.camera.rotationAngle + deltaTheta)
        } else if (currentInput.mouseWheelYChange != 0) {
            if (currentInput.mouseWheelYChange < 0) {
                this.camera.increaseZoom()
            } else {
                this.camera.decreaseZoom()
            }
        }

        // Reset Input
        this.playerCurentRawInput.mouseWheelXChange = 0
        this.playerCurentRawInput.mouseWheelYChange = 0
        // this.playerCurentRawInput.mouseOneIsDown = false
        // // this.playerCurentRawInput.mouseTwoIsDown = false
        // this.playerCurentRawInput.mouseThreeIsDown = false
    }
}

// To render something we need to know
// Position
// Model
// Layer?

// To move we need to know
// Current Position
// Target Position
// Move speed

// To take damage we need to know
// Current health
// Damage
// Damage source

// To deal damage we need to know
// Target health
// Target defence
// Attacker attack






// Combat System
// What does it do
// - Allows entities to damage each other
// - Allows entities to receive damage
// - 
// What does it need to know
// -

export interface RawInput {
    mousePositionX: number
    mousePositionY: number
    mouseWheelXChange: number
    mouseWheelYChange: number
    mouseOneIsDown: boolean
    mouseTwoIsDown: boolean
    mouseThreeIsDown: boolean
}

export interface ProcessedInput {
    mouseMoved: boolean

    mouseXCanvasPosition: number
    mouseYCanvasPosition: number

    mouseWheelXChange: number
    mouseWheelYChange: number

    mouseOneIsDown: boolean
    mouseOnePressed: boolean
    mouseOneReleased: boolean

    mouseTwoIsDown: boolean
    mouseTwoPressed: boolean
    mouseTwoReleased: boolean

    mouseThreeIsDown: boolean
    mouseThreePressed: boolean
    mouseThreeReleased: boolean

}