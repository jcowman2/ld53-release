import { GameObjects, Input, Scene } from "phaser";
import { MaterialCode, SpellData, SpellType } from "./SpellData";
import {
    DEFAULT_TEXT_COLOR,
    FONT_FAMILY,
    SCREEN_WIDTH
} from "../../config/Constants";
import SpellKeys from "./SpellKeys";
import KeyListenerBuilder from "../../utils/KeyListenerBuilder";

const SPELL_KEYS_Y = 126;
const SPELL_READY_Y = SPELL_KEYS_Y + 80;

export default class SpellcastDetails extends GameObjects.Container {
    keyListener: KeyListenerBuilder;
    spellKeys: SpellKeys;

    constructor(
        scene: Scene,
        private spellData: SpellData,
        onKeyDown: (
            code: MaterialCode,
            committedMaterials: MaterialCode[],
            recipe: MaterialCode[]
        ) => void,
        private onCast: (spell: SpellType) => void
    ) {
        super(scene, SCREEN_WIDTH / 2, 80);
        scene.add.existing(this);

        const title = new GameObjects.Text(scene, 0, 0, spellData.name, {
            color: DEFAULT_TEXT_COLOR,
            fontSize: 72,
            fontFamily: FONT_FAMILY
        }).setOrigin(0.5, 0);
        const description = new GameObjects.Text(
            scene,
            0,
            74,
            `"${spellData.description}"`,
            {
                color: DEFAULT_TEXT_COLOR,
                fontSize: 32,
                fontStyle: "italic",
                fontFamily: FONT_FAMILY
            }
        ).setOrigin(0.5, 0);

        this.spellKeys = new SpellKeys(scene, spellData.recipe, onKeyDown);
        this.spellKeys.setY(SPELL_KEYS_Y);
        this.spellKeys.x -= this.spellKeys.getBounds().width / 2;

        this.add([title, description, this.spellKeys]);

        this.keyListener = new KeyListenerBuilder(scene);
    }

    destroy(fromScene?: boolean): void {
        this.keyListener.destroy();
        super.destroy(fromScene);
    }

    commitMaterial(code: MaterialCode) {
        this.spellKeys.commitMaterial(code);
        if (
            this.spellKeys.committedMaterials.length ===
            this.spellKeys.recipe.length
        ) {
            this._showSpellReady();
        }
    }

    getCommittedMaterials() {
        return this.spellKeys.committedMaterials;
    }

    _showSpellReady() {
        const spaceKey = new GameObjects.Image(
            this.scene,
            0,
            SPELL_READY_Y,
            "spaceKey"
        )
            .setOrigin(0.5, 0)
            .setScale(1.5, 1.5);
        const text = new GameObjects.Text(
            this.scene,
            0,
            spaceKey.y + spaceKey.getBounds().height / 2,
            "PRESS SPACE!",
            {
                color: DEFAULT_TEXT_COLOR,
                fontSize: 72,
                fontFamily: FONT_FAMILY
            }
        ).setOrigin(0.5, 0.5);
        this.add([spaceKey, text]);

        this.keyListener.add(
            Input.Keyboard.KeyCodes.SPACE,
            () => {
                spaceKey.setAlpha(0.7);
                spaceKey.setTint(0xffff00);
            },
            () => {
                this.onCast(this.spellData.type);
            }
        );
    }
}
