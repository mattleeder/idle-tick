import { CAMERA_MAX_ZOOM_LEVEL, CAMERA_MIN_ZOOM_LEVEL } from "./globals"
import { ScreenPosition, WorldPosition } from "./position";


export interface Resolution {
    width: number,
    height: number,
}

export interface CameraControls {
    shouldRotate: boolean
    previousMousePosition: ScreenPosition;
}

interface RenderBoundsData {
    topLeft: WorldPosition,
    bottomRight: WorldPosition,
    topLeftScreenPosition: ScreenPosition,
}

export function modClamp(numberToClamp: number, max:number): number {
    const intermediate = numberToClamp % max
    if (intermediate < 0) {
        return max + intermediate
    }
    return intermediate
}

export function clamp(numberToClamp: number, min: number, max: number): number {
    return Math.max(Math.min(numberToClamp, max), min)
}

export function roundTowardZero(number: number): number {
    if (number < 0) {
        return Math.floor(number + 1)
    }
    return Math.floor(number)
}

export function rotateWorldPositionAboutPoint(position: WorldPosition, rotationOrigin: WorldPosition, rotationAngle: number): WorldPosition {
    const positionWithNewOrigin = position.sub(rotationOrigin)
    const rotatedX = positionWithNewOrigin.x * Math.cos(rotationAngle) - positionWithNewOrigin.y * Math.sin(rotationAngle)
    const rotatedY = positionWithNewOrigin.x * Math.sin(rotationAngle) + positionWithNewOrigin.y * Math.cos(rotationAngle)

    const rotatedPositionWithNewOrigin = new WorldPosition(rotatedX, rotatedY)
    const rotatedPositionWithOriginalOrigin = rotatedPositionWithNewOrigin.add(rotationOrigin)
    return rotatedPositionWithOriginalOrigin
}

export function rotateScreenPositionAboutPoint(position: ScreenPosition, rotationOrigin: ScreenPosition, rotationAngle: number): ScreenPosition {
    const positionWithNewOrigin = position.sub(rotationOrigin)
    const rotatedX = positionWithNewOrigin.x * Math.cos(rotationAngle) - positionWithNewOrigin.y * Math.sin(rotationAngle)
    const rotatedY = positionWithNewOrigin.x * Math.sin(rotationAngle) + positionWithNewOrigin.y * Math.cos(rotationAngle)

    const rotatedPositionWithNewOrigin = new ScreenPosition(rotatedX, rotatedY)
    const rotatedPositionWithOriginalOrigin = rotatedPositionWithNewOrigin.add(rotationOrigin)
    return rotatedPositionWithOriginalOrigin
}

export class Camera {
    _worldPosition: WorldPosition = new WorldPosition(2, 2);
    resolution: Resolution;
    zoomLevel: number = 1;
    zoomSensitivity: number = 0.2;
    rotationAngle: number = 0;
    tileSize: number;
    baseTileSize: number;

    constructor(cameraResolution: Resolution, tileSize: number) {
        this.resolution = cameraResolution
        this.tileSize = tileSize
        this.baseTileSize = tileSize
    }

    getWorldPosition(): WorldPosition {
        return this._worldPosition
    }

    setWorldPosition(newWorldPosition: WorldPosition): void {
        this._worldPosition = newWorldPosition
    }

    worldToScreen(worldPosition: WorldPosition): ScreenPosition {
        const screenCentre = this.getScreenCentre()
        const flatScreenPosition =  new ScreenPosition(
            (worldPosition.x - this.getWorldPosition().x) * this.tileSize + screenCentre.x - this.tileSize / 2,
            (worldPosition.y - this.getWorldPosition().y) * this.tileSize + screenCentre.y - this.tileSize / 2,
        )

        return flatScreenPosition
    }

    screenToWorld(screenPosition: ScreenPosition): WorldPosition {
        const screenCentre = this.getScreenCentre()
        const topLeftWorldPosition = new WorldPosition(this.getWorldPosition().x - Math.floor(screenCentre.x / this.tileSize), this.getWorldPosition().y - Math.floor(screenCentre.y / this.tileSize))
        const topLeftScreenPosition = this.worldToScreen(topLeftWorldPosition)
        const screenPositionWithZeroRotation = rotateScreenPositionAboutPoint(screenPosition, screenCentre, -this.rotationAngle)
        const dx = screenPositionWithZeroRotation.x - topLeftScreenPosition.x
        const dy = screenPositionWithZeroRotation.y - topLeftScreenPosition.y

        console.log(`clickWorldPosition: ${topLeftWorldPosition.x}, ${topLeftWorldPosition.y}`)

        return new WorldPosition(topLeftWorldPosition.x + dx/ this.tileSize, topLeftWorldPosition.y + dy / this.tileSize)
    }

    roundWorldToTile(worldPosition: WorldPosition): WorldPosition {
        return new WorldPosition(
            Math.floor(worldPosition.x),
            Math.floor(worldPosition.y),
        )
    }

    centreToWorldPosition(worldPosition: WorldPosition): void {
        this.setWorldPosition(worldPosition)
    }

    move(dx: number, dy: number): void {
        console.log(`old position: ${this.getWorldPosition().x},${this.getWorldPosition().y}`)
        const delta = new WorldPosition(dx, dy)
        this.setWorldPosition(this.getWorldPosition().add(delta))
        console.log(`new position: ${this.getWorldPosition().x},${this.getWorldPosition().y}`)
    }

    getScreenCentre(): ScreenPosition {
        return new ScreenPosition(
            this.resolution.width / 2,
            this.resolution.height / 2,
        )
    }

    increaseZoom(): void {
        this.setZoom(this.zoomLevel + this.zoomSensitivity)
    }

    decreaseZoom(): void {
        this.setZoom(this.zoomLevel - this.zoomSensitivity)
    }

    setZoom(zoomLevel: number): void {
        this.zoomLevel = Math.max(CAMERA_MIN_ZOOM_LEVEL, Math.min(zoomLevel, CAMERA_MAX_ZOOM_LEVEL))
        this.tileSize = this.baseTileSize * this.zoomLevel
    }

    setRotationAngle(rotationAngle: number): void {
        this.rotationAngle = modClamp(rotationAngle, 2 * Math.PI)
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const cameraScreenPosition = this.worldToScreen(this.getWorldPosition())
        // Draw camera position
        ctx.beginPath()
        ctx.arc(cameraScreenPosition.x + this.tileSize / 2, cameraScreenPosition.y + this.tileSize / 2, this.tileSize / 2, 0, 2 * Math.PI)
        ctx.stroke()
    }

    // Calculate long edge of camera
    // Half it and add 1 and ceil
    // Subtract this from camera x position and camera y position
    // Double it and use this to draw a square around the camera, draw everything in this square and rotate the whole square
    getRenderBounds(): RenderBoundsData {
        const cameraHalfWidth = this.resolution.width / 2
        const cameraHalfHeight = this.resolution.height / 2
        const cameraRadius = Math.sqrt((cameraHalfWidth) ** 2 + (cameraHalfHeight) ** 2)

        const cameraRadiusInTiles = Math.ceil(cameraRadius / this.tileSize) + 1

        const topLeftWorldPosition = new WorldPosition(
            Math.floor(this.getWorldPosition().x - cameraRadiusInTiles),
            Math.floor(this.getWorldPosition().y - cameraRadiusInTiles),
        )

        const bottomRightWorldPosition = new WorldPosition(
            Math.ceil(this.getWorldPosition().x + cameraRadiusInTiles),
            Math.ceil(this.getWorldPosition().y + cameraRadiusInTiles),
        )

        return {
            topLeft: topLeftWorldPosition,
            topLeftScreenPosition: this.worldToScreen(topLeftWorldPosition),
            bottomRight: bottomRightWorldPosition,
        }
    }
}