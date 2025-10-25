import { ITEM_MODELS_FILE_EXTENSION, ITEM_MODELS_LOCATION, ITEMS, type ItemKeys } from "./globals";

interface ModelInfo {
    src: string
}

const ITEM_MODELS = new Map<ItemKeys, ModelInfo>([
    [ITEMS.TwistedBow, { src: "twisted_bow" }],
    [ITEMS.FortifiedMasoriBody, { src: "fortified_masori_body" }],
    [ITEMS.FortifiedMasoriChaps, { src: "fortified_masori_chaps" }],
    [ITEMS.HealthPotionFourDose, { src: "health_potion_four_dose" }],
    [ITEMS.HealthPotionThreeDose, { src: "health_potion_three_dose" }],
    [ITEMS.HealthPotionTwoDose, { src: "health_potion_two_dose" }],
    [ITEMS.HealthPotionOneDose, { src: "health_potion_one_dose" }],
    [ITEMS.PrayerPotionFourDose, { src: "prayer_potion_four_dose" }],
    [ITEMS.PrayerPotionThreeDose, { src: "prayer_potion_three_dose" }],
    [ITEMS.PrayerPotionTwoDose, { src: "prayer_potion_two_dose" }],
    [ITEMS.PrayerPotionOneDose, { src: "prayer_potion_one_dose" }],
    [ITEMS.EmptyVial, { src: "empty_vial" }],
])

export function getItemModel(itemKey: ItemKeys) {
    const itemModelInfo = ITEM_MODELS.get(itemKey)
    if (itemModelInfo === undefined) {
        throw new Error(`Could not find itemModel for :${itemKey}`)
    }
    return ITEM_MODELS_LOCATION + itemModelInfo.src + ITEM_MODELS_FILE_EXTENSION
}