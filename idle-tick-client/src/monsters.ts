import type { CombatEngine } from "./combat_engine"
import type { Coordinator } from "./ecs"
import type { TransformComponent, ModelComponent, HealthComponent, HitSplatComponent, OffsensiveStatsComponent, DefensiveStatsComponent, SimpleBehaviourComponent, DamageReceiverComponent } from "./ecs_components"
import { ComponentTypes } from "./ecs_types"
import { WorldPosition } from "./position"
import { addStandardMonsterMovementComponentToEntity, createStandardRangeAttack, getAllTiles } from "./utilities"

export function createTestMonster(coordinator: Coordinator) {
    const monster  = coordinator.createEntity()
    addStandardMonsterMovementComponentToEntity(coordinator, monster)

    coordinator.addComponent<TransformComponent>(monster, ComponentTypes.Transform, {
        actualNorthWestPosition: new WorldPosition(1, 1),
        renderNorthWestPosition: new WorldPosition(1, 1),
        widthInTiles: 1,
        heightInTiles: 1
    })
    coordinator.addComponent<ModelComponent>(monster, ComponentTypes.Model, {
        currentModel: "src/assets/monster.png",
        animationPlayTimeTicks: 1,
        animationDurationTicks: 1,
        animationShouldLoop: true,
        animationHasEnded: false,
    })
    coordinator.addComponent<HealthComponent>(monster, ComponentTypes.Health, {
        currentHealth: 99,
        maxHealth: 99,
    })
    coordinator.addComponent<HitSplatComponent>(monster, ComponentTypes.HitSplat, {
        hitSplats: [],
    })
    coordinator.addComponent<OffsensiveStatsComponent>(monster, ComponentTypes.OffensiveStats, {
        attackLevel: 140,
        strengthLevel: 180,
        magicLevel: 90,
        rangedLevel: 250,

        stabAttackBonus: 0,
        slashAttackBonus: 0,
        crushAttackBonus: 0,
        rangedAttackBonus: 40,
        magicAttackBonus: 0,

        meleeStrengthBonus: 0,
        rangedStrengthBonus: 50,
        magicDamageBonus: 0,
        prayerBonus: 0,

        attackRange: 10,
        attackCooldown: 4,
        ticksUntilCanAttack: 0,
        createAttack: createStandardRangeAttack,
    })
    coordinator.addComponent<DefensiveStatsComponent>(monster, ComponentTypes.DefensiveStats, {
        magicLevel: 90,
        defenceLevel: 60,

        stabDefenceBonus: 0,
        slashDefenceBonus: 0,
        crushDefenceBonus:0,
        rangedDefenceBonus: 0,
        magicDefenceBonus: 0,
    })
    coordinator.addComponent<SimpleBehaviourComponent>(monster, ComponentTypes.SimpleBehaviour, {
        hasBehaviour: true
    })
    coordinator.addComponent<DamageReceiverComponent>(monster, ComponentTypes.DamageReceiver, {
        damage: [],
    })

    return monster
}

export function createBatMonster(engine: CombatEngine, coordinator: Coordinator, spawnLocation: WorldPosition) {
    const monster = coordinator.createEntity()
    addStandardMonsterMovementComponentToEntity(coordinator, monster)

    const transformComponent: TransformComponent = {
        actualNorthWestPosition: spawnLocation,
        renderNorthWestPosition: spawnLocation,
        widthInTiles: 2,
        heightInTiles: 2,
    }
    coordinator.addComponent<TransformComponent>(monster, ComponentTypes.Transform, transformComponent)
    coordinator.addComponent<ModelComponent>(monster, ComponentTypes.Model, {
        currentModel: "src/assets/bat_monster.png",
        animationPlayTimeTicks: 1,
        animationDurationTicks: 1,
        animationShouldLoop: true,
        animationHasEnded: false,
    })
    coordinator.addComponent<HealthComponent>(monster, ComponentTypes.Health, {
        currentHealth: 25,
        maxHealth: 25,
    })
    coordinator.addComponent<HitSplatComponent>(monster, ComponentTypes.HitSplat, {
        hitSplats: [],
    })
    coordinator.addComponent<OffsensiveStatsComponent>(monster, ComponentTypes.OffensiveStats, {
        attackLevel: 0,
        strengthLevel: 0,
        magicLevel: 120,
        rangedLevel: 120,

        stabAttackBonus: 0,
        slashAttackBonus: 0,
        crushAttackBonus: 0,
        rangedAttackBonus: 30,
        magicAttackBonus: 0,

        meleeStrengthBonus: 0,
        rangedStrengthBonus: 30,
        magicDamageBonus: 0,
        prayerBonus: 0,

        attackRange: 4,
        attackCooldown: 3,
        ticksUntilCanAttack: 0,
        createAttack: createStandardRangeAttack,
    })
    coordinator.addComponent<DefensiveStatsComponent>(monster, ComponentTypes.DefensiveStats, {
        magicLevel: 120,
        defenceLevel: 55,

        stabDefenceBonus: 30,
        slashDefenceBonus: 30,
        crushDefenceBonus: 30,
        rangedDefenceBonus: 45,
        magicDefenceBonus: -20,
    })
    coordinator.addComponent<SimpleBehaviourComponent>(monster, ComponentTypes.SimpleBehaviour, {
        hasBehaviour: true
    })
    coordinator.addComponent<DamageReceiverComponent>(monster, ComponentTypes.DamageReceiver, {
        damage: [],
    })

    const tiles = getAllTiles(transformComponent)
    engine.blockTiles(tiles)

    return monster
}

export function createSmallMeleeMonster(engine: CombatEngine, coordinator: Coordinator, spawnLocation: WorldPosition) {
    const monster = coordinator.createEntity()
    addStandardMonsterMovementComponentToEntity(coordinator, monster)
    const transformComponent: TransformComponent = {
        actualNorthWestPosition: spawnLocation,
        renderNorthWestPosition: spawnLocation,
        widthInTiles: 3,
        heightInTiles: 3,
    }

    coordinator.addComponent<TransformComponent>(monster, ComponentTypes.Transform, transformComponent)
    coordinator.addComponent<ModelComponent>(monster, ComponentTypes.Model, {
        currentModel: "src/assets/small_melee_monster.png",
        animationPlayTimeTicks: 1,
        animationDurationTicks: 1,
        animationShouldLoop: true,
        animationHasEnded: false,
    })
    coordinator.addComponent<HealthComponent>(monster, ComponentTypes.Health, {
        currentHealth: 40,
        maxHealth: 40,
    })
    coordinator.addComponent<HitSplatComponent>(monster, ComponentTypes.HitSplat, {
        hitSplats: [],
    })
    coordinator.addComponent<OffsensiveStatsComponent>(monster, ComponentTypes.OffensiveStats, {
        attackLevel: 160,
        strengthLevel: 160,
        magicLevel: 160,
        rangedLevel: 160,

        stabAttackBonus: 0,
        slashAttackBonus: 0,
        crushAttackBonus: 0,
        rangedAttackBonus: 45,
        magicAttackBonus: 45,

        meleeStrengthBonus: 45,
        rangedStrengthBonus: 45,
        magicDamageBonus: 45,
        prayerBonus: 0,

        attackRange: 10,
        attackCooldown: 6,
        ticksUntilCanAttack: 0,
        createAttack: createStandardRangeAttack,
    })
    coordinator.addComponent<DefensiveStatsComponent>(monster, ComponentTypes.DefensiveStats, {
        magicLevel: 160,
        defenceLevel: 95,

        stabDefenceBonus: 25,
        slashDefenceBonus: 25,
        crushDefenceBonus: 25,
        rangedDefenceBonus: 25,
        magicDefenceBonus: 25,
    })
    coordinator.addComponent<SimpleBehaviourComponent>(monster, ComponentTypes.SimpleBehaviour, {
        hasBehaviour: true
    })
    coordinator.addComponent<DamageReceiverComponent>(monster, ComponentTypes.DamageReceiver, {
        damage: [],
    })

    const tiles = getAllTiles(transformComponent)
    engine.blockTiles(tiles)

    return monster
}

export function createBigMeleeMonster(engine: CombatEngine, coordinator: Coordinator, spawnLocation: WorldPosition) {
    const monster = coordinator.createEntity()
    addStandardMonsterMovementComponentToEntity(coordinator, monster)
    const transformComponent: TransformComponent = {
        actualNorthWestPosition: spawnLocation,
        renderNorthWestPosition: spawnLocation,
        widthInTiles: 4,
        heightInTiles: 4,
    }

    coordinator.addComponent<TransformComponent>(monster, ComponentTypes.Transform, transformComponent)
    coordinator.addComponent<ModelComponent>(monster, ComponentTypes.Model, {
        currentModel: "src/assets/big_melee_monster.png",
        animationPlayTimeTicks: 1,
        animationDurationTicks: 1,
        animationShouldLoop: true,
        animationHasEnded: false,
    })
    coordinator.addComponent<HealthComponent>(monster, ComponentTypes.Health, {
        currentHealth: 75,
        maxHealth: 75,
    })
    coordinator.addComponent<HitSplatComponent>(monster, ComponentTypes.HitSplat, {
        hitSplats: [],
    })
    coordinator.addComponent<OffsensiveStatsComponent>(monster, ComponentTypes.OffensiveStats, {
        attackLevel: 210,
        strengthLevel: 290,
        magicLevel: 120,
        rangedLevel: 220,

        stabAttackBonus: 0,
        slashAttackBonus: 0,
        crushAttackBonus: 0,
        rangedAttackBonus: 0,
        magicAttackBonus: 45,

        meleeStrengthBonus: 40,
        rangedStrengthBonus: 0,
        magicDamageBonus: 0,
        prayerBonus: 0,

        attackRange: 1,
        attackCooldown: 4,
        ticksUntilCanAttack: 0,
        createAttack: createStandardRangeAttack,
    })
    coordinator.addComponent<DefensiveStatsComponent>(monster, ComponentTypes.DefensiveStats, {
        magicLevel: 120,
        defenceLevel: 95,

        stabDefenceBonus: 65,
        slashDefenceBonus: 65,
        crushDefenceBonus: 65,
        rangedDefenceBonus: 50,
        magicDefenceBonus: 30,
    })
    coordinator.addComponent<SimpleBehaviourComponent>(monster, ComponentTypes.SimpleBehaviour, {
        hasBehaviour: true
    })
    coordinator.addComponent<DamageReceiverComponent>(monster, ComponentTypes.DamageReceiver, {
        damage: [],
    })

    const tiles = getAllTiles(transformComponent)
    engine.blockTiles(tiles)

    return monster
}

export function createBigRangedMonster(engine: CombatEngine, coordinator: Coordinator, spawnLocation: WorldPosition) {
    const monster = coordinator.createEntity()
    addStandardMonsterMovementComponentToEntity(coordinator, monster)
    const transformComponent: TransformComponent = {
        actualNorthWestPosition: spawnLocation,
        renderNorthWestPosition: spawnLocation,
        widthInTiles: 3,
        heightInTiles: 3,
    }

    coordinator.addComponent<TransformComponent>(monster, ComponentTypes.Transform, transformComponent)
    coordinator.addComponent<ModelComponent>(monster, ComponentTypes.Model, {
        currentModel: "src/assets/big_ranged_monster.png",
        animationPlayTimeTicks: 1,
        animationDurationTicks: 1,
        animationShouldLoop: true,
        animationHasEnded: false,
    })
    coordinator.addComponent<HealthComponent>(monster, ComponentTypes.Health, {
        currentHealth: 125,
        maxHealth: 125,
    })
    coordinator.addComponent<HitSplatComponent>(monster, ComponentTypes.HitSplat, {
        hitSplats: [],
    })
    coordinator.addComponent<OffsensiveStatsComponent>(monster, ComponentTypes.OffensiveStats, {
        attackLevel: 140,
        strengthLevel: 180,
        magicLevel: 90,
        rangedLevel: 250,

        stabAttackBonus: 0,
        slashAttackBonus: 0,
        crushAttackBonus: 0,
        rangedAttackBonus: 40,
        magicAttackBonus: 0,

        meleeStrengthBonus: 0,
        rangedStrengthBonus: 50,
        magicDamageBonus: 0,
        prayerBonus: 0,

        attackRange: 15,
        attackCooldown: 4,
        ticksUntilCanAttack: 0,
        createAttack: createStandardRangeAttack,
    })
    coordinator.addComponent<DefensiveStatsComponent>(monster, ComponentTypes.DefensiveStats, {
        magicLevel: 90,
        defenceLevel: 60,

        stabDefenceBonus: 0,
        slashDefenceBonus: 0,
        crushDefenceBonus: 0,
        rangedDefenceBonus: 0,
        magicDefenceBonus: 0,
    })
    coordinator.addComponent<SimpleBehaviourComponent>(monster, ComponentTypes.SimpleBehaviour, {
        hasBehaviour: true
    })
    coordinator.addComponent<DamageReceiverComponent>(monster, ComponentTypes.DamageReceiver, {
        damage: [],
    })

    const tiles = getAllTiles(transformComponent)
    engine.blockTiles(tiles)

    return monster
}

export function createBigMageMonster(engine: CombatEngine, coordinator: Coordinator, spawnLocation: WorldPosition) {
    const monster = coordinator.createEntity()
    addStandardMonsterMovementComponentToEntity(coordinator, monster)
    const transformComponent: TransformComponent = {
        actualNorthWestPosition: spawnLocation,
        renderNorthWestPosition: spawnLocation,
        widthInTiles: 4,
        heightInTiles: 4,
    }

    coordinator.addComponent<TransformComponent>(monster, ComponentTypes.Transform, transformComponent)
    coordinator.addComponent<ModelComponent>(monster, ComponentTypes.Model, {
        currentModel: "src/assets/big_mage_monster.png",
        animationPlayTimeTicks: 1,
        animationDurationTicks: 1,
        animationShouldLoop: true,
        animationHasEnded: false,
    })
    coordinator.addComponent<HealthComponent>(monster, ComponentTypes.Health, {
        currentHealth: 220,
        maxHealth: 220,
    })
    coordinator.addComponent<HitSplatComponent>(monster, ComponentTypes.HitSplat, {
        hitSplats: [],
    })
    coordinator.addComponent<OffsensiveStatsComponent>(monster, ComponentTypes.OffensiveStats, {
        attackLevel: 370,
        strengthLevel: 510,
        magicLevel: 300,
        rangedLevel: 510,

        stabAttackBonus: 0,
        slashAttackBonus: 0,
        crushAttackBonus: 0,
        rangedAttackBonus: 0,
        magicAttackBonus: 80,

        meleeStrengthBonus: 0,
        rangedStrengthBonus: 0,
        magicDamageBonus: 0,
        prayerBonus: 0,

        attackRange: 15,
        attackCooldown: 4,
        ticksUntilCanAttack: 0,
        createAttack: createStandardRangeAttack,
    })
    coordinator.addComponent<DefensiveStatsComponent>(monster, ComponentTypes.DefensiveStats, {
        magicLevel: 300,
        defenceLevel: 260,

        stabDefenceBonus: 0,
        slashDefenceBonus: 0,
        crushDefenceBonus: 0,
        rangedDefenceBonus: 0,
        magicDefenceBonus: 0,
    })
    coordinator.addComponent<SimpleBehaviourComponent>(monster, ComponentTypes.SimpleBehaviour, {
        hasBehaviour: true
    })
    coordinator.addComponent<DamageReceiverComponent>(monster, ComponentTypes.DamageReceiver, {
        damage: [],
    })

    const tiles = getAllTiles(transformComponent)
    engine.blockTiles(tiles)

    return monster
}