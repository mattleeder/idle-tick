interface Position2D {
    x: number;
    y: number;
}


class Position {
    static add(a: Position2D, b: Position2D): Position2D {
        return {
            x: a.x + b.x,
            y: a.y + b.y
        }
    }

    static sub(a: Position2D, b: Position2D): Position2D {
        return {
            x: a.x - b.x,
            y: a.y - b.y,
        }
    }

    static mul(a: Position2D, scalar: number): Position2D {
        return {
            x: a.x * scalar,
            y: a.y * scalar,
        }
    }

    static equals(a: Position2D, b: Position2D): boolean {
        return a.x == b.x && a.y == b.y
    }

    static copy(a: Position2D): Position2D {
        return {
            x: a.x,
            y: a.y,
        }
    }
}

export class WorldPosition implements Position2D {
    public readonly x: number
    public readonly y: number
    private readonly type!: "world"

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    add(other: WorldPosition): WorldPosition {
        const result = Position.add(this, other);
        return new WorldPosition(result.x, result.y);
    }

    sub(other: WorldPosition): WorldPosition {
        const result = Position.sub(this, other)
        return new WorldPosition(result.x, result.y)
    }

    mul(scalar: number): WorldPosition {
        const result = Position.mul(this, scalar)
        return new WorldPosition(result.x, result.y)
    }

    equals(other: WorldPosition): boolean {
        return Position.equals(this, other)
    }

    copy(): WorldPosition {
        return new WorldPosition(this.x, this.y)
    }

    tileDistanceTo(other: WorldPosition): number {
        return Math.max(Math.abs(other.x - this.x), Math.abs(other.y - this.y))
    }

    getCentre(): WorldPosition {
        const newX = Math.floor(this.x) + 0.5
        const newY = Math.floor(this.y) + 0.5
        return new WorldPosition(newX, newY)
    }

    floor(): WorldPosition {
        return new WorldPosition(Math.floor(this.x), Math.floor(this.y))
    }
}


export class ScreenPosition implements Position2D {
    public readonly x: number
    public readonly y: number
    private readonly type!: "screen"

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    add(other: ScreenPosition): ScreenPosition {
        const result = Position.add(this, other);
        return new ScreenPosition(result.x, result.y);
    }

    sub(other: ScreenPosition): ScreenPosition {
        const result = Position.sub(this, other)
        return new ScreenPosition(result.x, result.y)
    }

    mul(scalar: number): ScreenPosition {
        const result = Position.mul(this, scalar)
        return new ScreenPosition(result.x, result.y)
    }

    equals(other: ScreenPosition): boolean {
        return Position.equals(this, other)
    }

    copy(): ScreenPosition {
        return new ScreenPosition(this.x, this.y)
    }

}