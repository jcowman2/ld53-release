import { GameObjects, Input, Scene } from "phaser";
import KeyListenerBuilder from "../../utils/KeyListenerBuilder";
import { SpellType } from "./SpellData";
import { FONT_FAMILY } from "../../config/Constants";

const SCALE = 0.8;
const HIGHLIGHT_PAD = 10;
const HIGHLIGHT_COLOR = 0xfff68d;

export default class SpellIcon extends GameObjects.Container {
    highlightRect: GameObjects.Rectangle;

    constructor(
        scene: Scene,
        public spell: SpellType,
        hotkey: number,
        x: number,
        y: number,
        onSelect: (spellIcon: SpellIcon) => void
    ) {
        super(scene, x, y);
        scene.add.existing(this);

        this.add([
            new GameObjects.Image(scene, 0, 0, "frame").setOrigin(0, 0),
            new GameObjects.Image(scene, 0, 0, spell).setOrigin(0, 0),
            new GameObjects.Text(scene, 52, 132, hotkey.toString(), {
                color: "#000000",
                fontSize: 64,
                align: "center",
                fontFamily: FONT_FAMILY
            })
        ]);
        this.setScale(SCALE, SCALE);

        const hotkeyCode = Input.Keyboard.KeyCodes.ZERO + hotkey;
        new KeyListenerBuilder(scene).add(hotkeyCode, () => {
            onSelect(this);
        });
    }

    highlight() {
        if (this.highlightRect != null) {
            this.highlightRect.setVisible(true);
            return;
        }
        const bounds = this.getBounds();
        this.highlightRect = new GameObjects.Rectangle(
            this.scene,
            -HIGHLIGHT_PAD,
            -HIGHLIGHT_PAD,
            (bounds.width * 1) / SCALE + 2 * HIGHLIGHT_PAD,
            (bounds.height * 1) / SCALE + 2 * HIGHLIGHT_PAD,
            HIGHLIGHT_COLOR
        ).setOrigin(0, 0);
        this.add(this.highlightRect);
        this.sendToBack(this.highlightRect);
    }

    unhighlight() {
        if (this.highlightRect != null) {
            this.highlightRect.setVisible(false);
        }
    }
}
