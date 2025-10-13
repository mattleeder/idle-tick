import type { PlayerDataGrabber } from "./access_player_data";
import type { Camera } from "./camera";
import { ScreenPosition } from "./position";
import { ControlledUiElement } from "./ui/controlled_ui_element";
import { dummyInteractiveUiElement, type IInteractiveUiElement } from "./ui/interactive_element";
import { RibbonButton } from "./ui/ribbon_button";
import { UiGroup } from "./ui/ui_group";


const combatIconDefaultImage = new Image()
combatIconDefaultImage.src = "src/assets/combaticon.png"

const combatButtonIconRecord: InteractiveUiElementStateImages = {
    default: combatIconDefaultImage,
    hovered: combatIconDefaultImage,
    down: combatIconDefaultImage,
    clicked: combatIconDefaultImage,
}

export function createNewUIElements(uiDataGrabber: PlayerDataGrabber, camera: Camera): IInteractiveUiElement[] {
    const ribbonButtonDimensions = {width: camera.resolution.width * 0.05, height: camera.resolution.height * 0.05}
    const ribbonGroupScreenPosition = new ScreenPosition(camera.resolution.width * 0.75, camera.resolution.height * 0.65)
    const ribbonGroup = new UiGroup(
        true,
        true,
        ribbonGroupScreenPosition,
        {x: 0, y: 0},
        {},
        {},
        {name: "ribbonGroup"}
    )

    const ribbonMenuController = new ControlledUiElement(dummyInteractiveUiElement)

    const combatButton = new RibbonButton(
        true,
        true,
        new ScreenPosition(0, 0),

    )
}