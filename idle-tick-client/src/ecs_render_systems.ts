import { BitSet } from "./bitSet"
import { System } from "./ecs"
import { type TransformComponent, type ModelComponent, type HitSplatComponent, type HealthComponent, type PrayerComponent } from "./ecs_components"
import { SystemTypes, ComponentTypes, type Signature, Prayers } from "./ecs_types"
import { MAX_SYSTEMS, protectFromMagicIcon, protectFromMeleeIcon, protectFromRangedIcon, TILE_SIZE_PIXELS } from "./globals"
import { ScreenPosition } from "./position"
import { getRenderCentreOfTransform } from "./utilities"

// Render System
// What does it do
// - Draws entities on screen
// What does it need
// - Animation Sheet        (model)
// - Animation Play Time    (model)
// - Animation Duration     (model)
// - Render position        (transform)
// - Tile width             (transform)
// - Tile height            (transform)
export class ModelRenderSystem extends System {
    initialise(): void {
        const systemTypeKey = SystemTypes.ModelRender
        
        const componentTypes = [
            ComponentTypes.Model,
            ComponentTypes.Transform,
        ]
        
        this.coordinator.registerSystem<ModelRenderSystem>(systemTypeKey, this)

        const signature: Signature = new BitSet(MAX_SYSTEMS)
        for (const componentType of componentTypes) {
            signature.set(this.coordinator.getComponentType(componentType))
        }
        this.coordinator.setSystemSignature(signature, systemTypeKey)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(_deltaTimeMs: number): void {
        // @TODO: need to have some kind of layering
        this.coordinator.ctx.save()

        for (const entity of this.entities) {
            // Draw box
            const transformComponent = this.coordinator.getComponent<TransformComponent>(entity, ComponentTypes.Transform)
            const modelComponent = this.coordinator.getComponent<ModelComponent>(entity, ComponentTypes.Model)

            const entityScreenPosition = this.coordinator.camera.worldToScreen(transformComponent.renderNorthWestPosition)
            const entityScreenWidth = transformComponent.widthInTiles * this.coordinator.camera.baseTileSize * this.coordinator.camera.zoomLevel
            const entityScreenHeight = transformComponent.heightInTiles * this.coordinator.camera.baseTileSize * this.coordinator.camera.zoomLevel

            this.coordinator.ctx.strokeStyle = "#ec0808ff"
            this.coordinator.ctx.lineWidth = 4
            this.coordinator.ctx.strokeRect(
                entityScreenPosition.x,
                entityScreenPosition.y,
                entityScreenWidth,
                entityScreenHeight
            )

            // Draw Model
            const modelImage = new Image()
            modelImage.src = modelComponent.currentModel

            // @TODO need to get actual frame index, frame width
            const frameIndex = 0
            const frameWidth = modelImage.width

            const animationSheetX = frameIndex * frameWidth
            const animationSheetY = 0
            const animationSheetWidth = frameWidth
            const animationSheetHeight = modelImage.height

            this.coordinator.ctx.drawImage(
                modelImage,
                animationSheetX,
                animationSheetY,
                animationSheetWidth,
                animationSheetHeight,
                entityScreenPosition.x,
                entityScreenPosition.y,
                entityScreenWidth,
                entityScreenHeight,
            )
        }

        this.coordinator.ctx.restore()
    }

    tick(): void {
        return
    }
}

export class HitSplatRenderSystem extends System {
    initialise(): void {
        const systemTypeKey = SystemTypes.HitSplatRender
        
        const componentTypes = [
            ComponentTypes.Transform,
            ComponentTypes.HitSplat,
        ]
        
        this.coordinator.registerSystem<HitSplatRenderSystem>(systemTypeKey, this)

        const signature: Signature = new BitSet(MAX_SYSTEMS)
        for (const componentType of componentTypes) {
            signature.set(this.coordinator.getComponentType(componentType))
        }
        this.coordinator.setSystemSignature(signature, systemTypeKey)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(_deltaTimeMs: number): void {
        // @TODO: need to have some kind of layering
        
        for (const entity of this.entities) {
            const transformComponent = this.coordinator.getComponent<TransformComponent>(entity, ComponentTypes.Transform)
            const hitSplatComponent = this.coordinator.getComponent<HitSplatComponent>(entity, ComponentTypes.HitSplat)
            
            if (hitSplatComponent.hitSplats.length == 0) {
                continue
            }
            
            const entityRenderCentreWorldPosition = getRenderCentreOfTransform(transformComponent)
            const entityRenderCentreScreenPosition = this.coordinator.camera.worldToScreen(entityRenderCentreWorldPosition)
            
            for (const hitsplat of hitSplatComponent.hitSplats) {
                this.coordinator.ctx.save()

                this.coordinator.ctx.arc(entityRenderCentreScreenPosition.x, entityRenderCentreScreenPosition.y, this.coordinator.camera.tileSize / 4, 0, 2 * Math.PI)
                this.coordinator.ctx.fillStyle = "#e01a1aff"
                this.coordinator.ctx.fill()

                // Rotate to make text upright
                this.coordinator.ctx.translate(entityRenderCentreScreenPosition.x, entityRenderCentreScreenPosition.y)
                this.coordinator.ctx.rotate(-this.coordinator.camera.rotationAngle)
                this.coordinator.ctx.translate(-entityRenderCentreScreenPosition.x, -entityRenderCentreScreenPosition.y)

                // @TODO, text needs to be centred
                this.coordinator.ctx.fillStyle = "#000000"
                this.coordinator.ctx.textAlign = "center"
                this.coordinator.ctx.fillText(`${hitsplat.damage}`, entityRenderCentreScreenPosition.x, entityRenderCentreScreenPosition.y)
                
                this.coordinator.ctx.restore()
            }
        }

    }

    tick(): void {
        return
    }
}

export class HealthBarRenderSystem extends System {
    initialise(): void {
        const systemTypeKey = SystemTypes.HealthBarRender
        
        const componentTypes = [
            ComponentTypes.Transform,
            ComponentTypes.Health,
        ]
        
        this.coordinator.registerSystem<HealthBarRenderSystem>(systemTypeKey, this)

        const signature: Signature = new BitSet(MAX_SYSTEMS)
        for (const componentType of componentTypes) {
            signature.set(this.coordinator.getComponentType(componentType))
        }
        this.coordinator.setSystemSignature(signature, systemTypeKey)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(_deltaTimeMs: number): void {
        // @TODO: need to have some kind of layering
        
        for (const entity of this.entities) {
            
            this.coordinator.ctx.save()
            
            const transformComponent = this.coordinator.getComponent<TransformComponent>(entity, ComponentTypes.Transform)
            const healthComponent = this.coordinator.getComponent<HealthComponent>(entity, ComponentTypes.Health)
            
            const entityScreenPosition = this.coordinator.camera.worldToScreen(transformComponent.renderNorthWestPosition)
            const entityCentreScreenPosition = this.coordinator.camera.worldToScreen(getRenderCentreOfTransform(transformComponent))
            const healthBarScreenPosition = entityScreenPosition.add(new ScreenPosition(0, -20))

            this.coordinator.ctx.translate(entityCentreScreenPosition.x, entityCentreScreenPosition.y)
            this.coordinator.ctx.rotate(-this.coordinator.camera.rotationAngle)
            this.coordinator.ctx.translate(-entityCentreScreenPosition.x, -entityCentreScreenPosition.y)

            const entityScreenWidth = transformComponent.widthInTiles * this.coordinator.camera.baseTileSize * this.coordinator.camera.zoomLevel

            const healthPercentage = healthComponent.currentHealth / healthComponent.maxHealth
            const healthBarHeight = TILE_SIZE_PIXELS / 8

            this.coordinator.ctx.fillStyle = "#ec0808ff"
            this.coordinator.ctx.fillRect(healthBarScreenPosition.x, healthBarScreenPosition.y, entityScreenWidth, healthBarHeight)
            
            this.coordinator.ctx.fillStyle = "#17f403ff"
            this.coordinator.ctx.fillRect(healthBarScreenPosition.x, healthBarScreenPosition.y, entityScreenWidth * healthPercentage, healthBarHeight)
            
            this.coordinator.ctx.restore()
        }

    }

    tick(): void {
        return
    }
}

export class PrayerRenderSystem extends System {
    static protectFromMageIcon: string= "src/assets/protect_from_mage.png"
    static protectFromRangeIcon: string = "src/assets/protect_from_range.png"
    static protectFromMeleeIcon: string = "src/assets/protect_from_melee.png"

    initialise(): void {
        // PrayerRenderSystem.protectFromMageIcon = "src/assets/protect_from_mage.png"
        // PrayerRenderSystem.protectFromRangeIcon = "src/assets/protect_from_range.png"
        // PrayerRenderSystem.protectFromMeleeIcon = "src/assets/protect_from_melee.png"

        const systemTypeKey = SystemTypes.PrayerRender

        const componentTypes = [
            ComponentTypes.Transform,
            ComponentTypes.Prayer,
        ]

        this.coordinator.registerSystem<PrayerRenderSystem>(systemTypeKey, this)

        const signature: Signature = new BitSet(MAX_SYSTEMS)
        for (const componentType of componentTypes) {
            signature.set(this.coordinator.getComponentType(componentType))
        }
        this.coordinator.setSystemSignature(signature, systemTypeKey)
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(_deltaTimeMs: number): void {
        
        for (const entity of this.entities) {
            const transformComponent = this.coordinator.getComponent<TransformComponent>(entity, ComponentTypes.Transform)
            const prayerComponent = this.coordinator.getComponent<PrayerComponent>(entity, ComponentTypes.Prayer)
            
            // @TODO: may need to handle multiple prayer types
            let prayerIcon = new Image()
            
            if (prayerComponent.activePrayers.has(Prayers.ProtectMage)) {
                prayerIcon = protectFromMagicIcon
            } else if (prayerComponent.activePrayers.has(Prayers.ProtectRange)) {
                prayerIcon  = protectFromRangedIcon
            } else if (prayerComponent.activePrayers.has(Prayers.ProtectMelee)) {
                prayerIcon = protectFromMeleeIcon
            } else {
                continue
            }
            
            
            const entityCentreScreenPosition = this.coordinator.camera.worldToScreen(getRenderCentreOfTransform(transformComponent))
            const prayerIconPosition = this.coordinator.camera.worldToScreen(transformComponent.renderNorthWestPosition).add(new ScreenPosition(0, -this.coordinator.camera.baseTileSize))
            
            this.coordinator.ctx.save()
            
            this.coordinator.ctx.translate(entityCentreScreenPosition.x, entityCentreScreenPosition.y)
            this.coordinator.ctx.rotate(-this.coordinator.camera.rotationAngle)
            this.coordinator.ctx.translate(-entityCentreScreenPosition.x, -entityCentreScreenPosition.y)

            this.coordinator.ctx.drawImage(
                prayerIcon,
                prayerIconPosition.x,
                prayerIconPosition.y,
                this.coordinator.camera.baseTileSize,
                this.coordinator.camera.baseTileSize,
            )

            this.coordinator.ctx.restore()
        }

    }

    tick(): void {
        
    }
}