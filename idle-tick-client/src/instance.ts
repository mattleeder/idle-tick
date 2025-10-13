import type { CombatEngine } from "./combat_engine"
import type { Coordinator } from "./ecs"
import { type Entity } from "./ecs_types"
import { createBatMonster, createBigMageMonster, createBigMeleeMonster, createBigRangedMonster, createSmallMeleeMonster } from "./monsters"
import { WorldPosition } from "./position"
import { testCaveTileMap } from "./tile_maps"
import { shuffleArray } from "./utilities"

export abstract class Instance {
    engine: CombatEngine
    
    constructor(engine: CombatEngine) {
        this.engine = engine
    }

    abstract tick(): void
}

type WaveSpawns = {
    BatMonster:             "batMonster",
    SmallMeleeMonster:      "smallMeleeMonster",
    BigMeleeMonster:        "bigMeleeMonster",
    BigRangedMonster:       "bigRangedMonster",
    BigMageMonster:         "bigMageMonster",
}

type WaveSpawnKeys = WaveSpawns[keyof WaveSpawns]

const WaveSpawnKeyToSpawnFunction: Record<WaveSpawnKeys, (engine: CombatEngine, coordinator: Coordinator, spawnLocation: WorldPosition) => Entity> = {
    batMonster:         createBatMonster,
    smallMeleeMonster:  createSmallMeleeMonster,
    bigMeleeMonster:    createBigMeleeMonster,
    bigRangedMonster:   createBigRangedMonster,
    bigMageMonster:     createBigMageMonster,
}

export class WaveTestInstance extends Instance {
    private wave: number
    private waveCooldownInTicks: number
    private currentCooldown: number
    private waveFinished: boolean
    private spawnPoints: WorldPosition[]
    private npcs: Entity[]
    private waveMonsters: Record<number, Record<WaveSpawnKeys, number>> = {
        1: {
            batMonster: 1,
            smallMeleeMonster: 0,
            bigMeleeMonster: 0,
            bigRangedMonster: 0,
            bigMageMonster: 0,
        },
        2: {
            batMonster: 1,
            smallMeleeMonster: 1,
            bigMeleeMonster: 0,
            bigRangedMonster: 0,
            bigMageMonster: 0,
        },
        3: {
            batMonster: 1,
            smallMeleeMonster: 1,
            bigMeleeMonster: 1,
            bigRangedMonster: 0,
            bigMageMonster: 0,
        },
        4: {
            batMonster: 1,
            smallMeleeMonster: 1,
            bigMeleeMonster: 1,
            bigRangedMonster: 1,
            bigMageMonster: 1,
        },
        5: {
            batMonster: 1,
            smallMeleeMonster: 1,
            bigMeleeMonster: 1,
            bigRangedMonster: 1,
            bigMageMonster: 1,
        }

    }

    constructor(engine: CombatEngine) {
        super(engine)
        console.log("Initialising WaveTestInstance")
        this.wave = 1
        this.waveCooldownInTicks = 10
        this.currentCooldown = 10
        this.waveFinished = true
        this.engine.setTileMap(testCaveTileMap)
        this.spawnPoints = [
            new WorldPosition(2, 3),
            new WorldPosition(23, 3),
            new WorldPosition(4, 9),
            new WorldPosition(24, 10),
            new WorldPosition(17, 15),
            new WorldPosition(6, 18),
            new WorldPosition(2, 20),
            new WorldPosition(24, 17),
        ]
    }

    private startWave(waveNumber: number) {
        console.log(`Starting Wave ${this.wave}!!!`)
        this.currentCooldown = this.waveCooldownInTicks
        this.waveFinished = false
        const randomisedSpawns = shuffleArray(this.spawnPoints)
        let spawnIndex = 0
        for (const [monsterType, amount] of Object.entries(this.waveMonsters[waveNumber])) {
            for (let i = 0; i < amount; i++) {
                const spawnFunction = WaveSpawnKeyToSpawnFunction[monsterType as WaveSpawnKeys]
                const spawnPoint = randomisedSpawns[spawnIndex]
                const npcEntity = spawnFunction(this.engine, this.engine.getCoordinator(), spawnPoint)
                this.engine.npcs.push(npcEntity)
                spawnIndex += 1
            }
        }
    }

    tick(): void {
        if (!this.waveFinished) {
            if (this.engine.npcs.length == 0) {
                this.waveFinished = true
                this.wave += 1
            }
        }
        
        if (this.waveFinished) {
            this.currentCooldown = Math.max(this.currentCooldown - 1, 0)
            console.log(`Wave Starting in ${this.currentCooldown} ticks`)
            if (this.currentCooldown <= 0) {
                this.startWave(this.wave)
            }
        }
    }
}