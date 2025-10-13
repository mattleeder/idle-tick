import { type OffsensiveStatsComponent, type  DefensiveStatsComponent, type PrayerComponent } from "./ecs_components"
import { type PrayerKeys } from "./ecs_types"
import { checkSuccess, getRandomInt } from "./utilities"

export const DamageTypes = {
    Melee: "melee",
    Ranged: "ranged",
    Magic: "magic",
} as const

export type DamageTypeKeys = typeof DamageTypes[keyof typeof DamageTypes]

export const DamageSubTypes = {
    Stab: "stab",
    Slash: "slash",
    Crush: "crush",
    Ranged: "ranged",
    Magic: "magic",
} as const

export type DamageSubTypeKeys = typeof DamageSubTypes[keyof typeof DamageSubTypes]

export interface AttackData {
    damageType: DamageSubTypeKeys,
    accuracyBonus: number,
    damageBonus: number,
    accuracyLevel: number,
    damageLevel: number,
}

export interface DefenceData {
    currentProtectionPrayers: Set<DamageTypeKeys>,
    defenceBonus: number,
    defenceLevel: number,
}

export function calculateDamage(attackData: AttackData, defenceData: DefenceData): number {
    if (attackData.accuracyBonus > defenceData.defenceBonus) {
        return attackData.damageBonus
    }

    return 0
}

export class DamageCalculator {
    
    static calculateDamage(damageDealerOffensiveStats: OffsensiveStatsComponent, damageReceiverDefensiveStats: DefensiveStatsComponent, damageAttackRollType: DamageSubTypeKeys, damageDefenceRollType: DamageSubTypeKeys, damageDealerPrayerComponent: PrayerComponent | null = null, damageReceiverPrayerComponent: PrayerComponent | null = null): number {

        const attackRoll = this.getAttackRoll(damageAttackRollType, damageDealerOffensiveStats)
        const defenceRoll = this.getDefenceRoll(damageDefenceRollType, damageReceiverDefensiveStats)

        const hitChance = this.calculateHitChance(attackRoll, defenceRoll)
        const maxHit = this.calculateMaximumHit(damageAttackRollType, damageDealerOffensiveStats)

        const damageSubTypeToPrayerLookupTable: Record<DamageSubTypeKeys, PrayerKeys> = {
            stab: "protectMelee",
            slash: "protectMelee",
            crush: "protectMelee",
            ranged: "protectRange",
            magic: "protectMage",
        }

        const defendingPrayer = damageSubTypeToPrayerLookupTable[damageAttackRollType]

         if (!checkSuccess(hitChance) || (damageReceiverPrayerComponent !== null && damageReceiverPrayerComponent.activePrayers.has(defendingPrayer))) {
            return 0
         }

         const damageRoll = this.getDamageRoll(maxHit)
         
         return damageRoll
    }

    static getAttackRoll(damageType: DamageSubTypeKeys, offensiveStats: OffsensiveStatsComponent) {
        let attackBonus = 0
        let effectiveLevel = 0
        let prayerEffect = 1

        switch(damageType) {
            case DamageSubTypes.Stab:
                attackBonus = offensiveStats.crushAttackBonus
                effectiveLevel = offensiveStats.attackLevel
                break;

            case DamageSubTypes.Slash:
                attackBonus = offensiveStats.stabAttackBonus
                effectiveLevel = offensiveStats.attackLevel
                break;
            
            case DamageSubTypes.Crush:
                attackBonus = offensiveStats.crushAttackBonus
                effectiveLevel = offensiveStats.attackLevel
                break;

            case DamageSubTypes.Ranged:
                attackBonus = offensiveStats.rangedAttackBonus
                effectiveLevel = offensiveStats.rangedLevel
                break;

            case DamageSubTypes.Magic:
                attackBonus = offensiveStats.magicAttackBonus
                effectiveLevel = offensiveStats.magicLevel
                break;
        }

        effectiveLevel = effectiveLevel * prayerEffect + 8

        return effectiveLevel * (attackBonus + 64)
    }

    static getDefenceRoll(damageType: DamageSubTypeKeys, defensiveStats: DefensiveStatsComponent) {
        let defenceBonus = 0
        let effectiveLevel = 0
        let prayerEffect = 1

        switch(damageType) {
            case DamageSubTypes.Stab:
                defenceBonus = defensiveStats.stabDefenceBonus
                effectiveLevel = defensiveStats.defenceLevel
                break;

            case DamageSubTypes.Slash:
                defenceBonus = defensiveStats.slashDefenceBonus
                effectiveLevel = defensiveStats.defenceLevel
                break;

            case DamageSubTypes.Crush:
                defenceBonus = defensiveStats.crushDefenceBonus
                effectiveLevel = defensiveStats.defenceLevel
                break;

            case DamageSubTypes.Ranged:
                defenceBonus = defensiveStats.rangedDefenceBonus
                effectiveLevel = defensiveStats.defenceLevel
                break;

            case DamageSubTypes.Magic:
                defenceBonus = defensiveStats.magicDefenceBonus
                effectiveLevel = 0.3 * defensiveStats.defenceLevel + 0.7 * defensiveStats.magicLevel
                break;
        }

        console.log(defensiveStats)
        console.log(`effectiveLevel: ${effectiveLevel}`)
        console.log(`prayerEffect: ${prayerEffect}`)
        console.log(`defenceBonus: ${defenceBonus}`)

        effectiveLevel = effectiveLevel * prayerEffect + 8

        return effectiveLevel * (defenceBonus + 64)
    }

    static calculateHitChance(attackRoll: number, defenceRoll: number) {
        if (attackRoll > defenceRoll) {
            const numerator = defenceRoll + 2
            const denominator = 2 * (attackRoll + 1)

            return 1 - (numerator / denominator)
        }

        const numerator = attackRoll
        const denominator = 2 * (defenceRoll + 1)

        return numerator / denominator
    }

    static calculateMaximumHit(damageType: DamageSubTypeKeys, offensiveStats: OffsensiveStatsComponent) {
        let strengthBonus = 0
        let effectiveLevel = 0
        let prayerEffect = 1

        switch (damageType) {
            case DamageSubTypes.Stab:
                strengthBonus = offensiveStats.meleeStrengthBonus
                effectiveLevel = offensiveStats.strengthLevel
                break;

            case DamageSubTypes.Slash:
                strengthBonus = offensiveStats.meleeStrengthBonus
                effectiveLevel = offensiveStats.strengthLevel
                break;

            case DamageSubTypes.Crush:
                strengthBonus = offensiveStats.meleeStrengthBonus
                effectiveLevel = offensiveStats.strengthLevel
                break;

            case DamageSubTypes.Ranged:
                strengthBonus = offensiveStats.rangedStrengthBonus
                effectiveLevel = offensiveStats.rangedLevel
                break;

            case DamageSubTypes.Magic:
                strengthBonus = offensiveStats.magicDamageBonus
                effectiveLevel = offensiveStats.magicLevel
                break;
        }

        effectiveLevel = effectiveLevel * prayerEffect + 8

        const numerator = effectiveLevel * (strengthBonus + 64) + 320
        const denominator = 640

        return Math.floor(numerator / denominator)
    }

    static getDamageRoll(maxHit: number) {
        return getRandomInt(1, maxHit)
    }
}