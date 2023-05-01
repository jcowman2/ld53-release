import { GameObjects, Scene } from "phaser";
import { MaterialData } from "../spells/SpellData";
import { DEFAULT_TEXT_COLOR, FONT_FAMILY } from "../../config/Constants";

const LABEL_FONT_SIZE = 32;
const COUNT_FONT_SIZE = 38;
const ICON_PAD_RIGHT = 10;
const COUNT_X = 300;
const COUNT_DEPLETED_TEXT_COLOR = "#ff0000";

export default class MaterialRow extends GameObjects.Container {
    nameText: GameObjects.Text;
    countText: GameObjects.Text;

    constructor(
        scene: Scene,
        material: MaterialData,
        count: number,
        x: number = 0,
        y: number = 0
    ) {
        super(scene, x, y);
        scene.add.existing(this);

        const icon = new GameObjects.Image(scene, 0, 0, material.type)
            .setScale(0.5, 0.5)
            .setOrigin(0, 0);
        const iconRightCenter = icon.getRightCenter();

        this.nameText = new GameObjects.Text(
            scene,
            iconRightCenter.x + ICON_PAD_RIGHT,
            iconRightCenter.y,
            material.name,
            {
                color: DEFAULT_TEXT_COLOR,
                fontSize: LABEL_FONT_SIZE,
                fontFamily: FONT_FAMILY
            }
        ).setOrigin(0, 0.5);

        this.updateCount(count);
        this.add([icon, this.nameText, this.countText]);
    }

    updateCount(newCount: number) {
        if (this.countText != null) {
            this.countText.destroy();
        }

        const nameRightCenter = this.nameText.getRightCenter();

        this.countText = new GameObjects.Text(
            this.scene,
            COUNT_X,
            nameRightCenter.y,
            `x${newCount}`,
            {
                color:
                    newCount > 0
                        ? DEFAULT_TEXT_COLOR
                        : COUNT_DEPLETED_TEXT_COLOR,
                fontSize: COUNT_FONT_SIZE,
                fontFamily: FONT_FAMILY
            }
        ).setOrigin(0, 0.5);
        this.add(this.countText);
    }
}
