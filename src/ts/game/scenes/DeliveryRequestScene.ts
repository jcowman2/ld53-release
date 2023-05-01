import { Input, Scene } from "phaser";
import { FONT_FAMILY, SCREEN_HEIGHT, SCREEN_WIDTH } from "../config/Constants";
import { MATERIALS, MaterialCode, MaterialData } from "../ui/spells/SpellData";
import KeyListenerBuilder from "../utils/KeyListenerBuilder";

const BG_COLOR = 0xffedbd;
const INK_COLOR = "#584619";

export default class DeliveryRequestScene extends Scene {
    constructor() {
        super("DeliveryRequestScene");
    }

    preload() {}

    create(data: { retry: boolean }) {
        this.cameras.main.setBackgroundColor(BG_COLOR);
        const x = 100;
        const styles = {
            fontFamily: FONT_FAMILY,
            fontSize: 48,
            color: INK_COLOR
        };
        this.add.text(x, 120, "Delivery Request: Urgent!!", {
            ...styles,
            fontSize: 86
        });

        this.add.text(
            x,
            260,
            "The market town requires the following supplies as soon as possible:",
            styles
        );

        const order = this._getMaterialsOrder();
        this.add
            .text(SCREEN_WIDTH / 2, 365, order[0].plural, {
                ...styles,
                fontSize: 64
            })
            .setOrigin(0.5);
        this.add
            .text(SCREEN_WIDTH / 2, 450, order[1].plural, {
                ...styles,
                fontSize: 64
            })
            .setOrigin(0.5);

        this.add.text(
            x,
            530,
            "The first trader to deliver these supplies will be rewarded handsomely.",
            styles
        );

        this.add
            .text(x, SCREEN_HEIGHT - 200, "Press SPACE to begin...", styles)
            .setAlpha(0.8);

        new KeyListenerBuilder(this).add(
            Input.Keyboard.KeyCodes.SPACE,
            () => {},
            () => this._startRace([order[0].code, order[1].code], data.retry)
        );
    }

    update() {}

    _startRace = (order: [MaterialCode, MaterialCode], retry: boolean) => {
        // if (retry) {
        //     this.scene.get("RacingScene").scene.restart();
        // } else {
        this.scene.start("RacingScene");
        // }

        this.scene.start("RacingOverlayScene", order);
    };

    _getMaterialsOrder(): MaterialData[] {
        const materials = [...MATERIALS];
        return [this._takeRandom(materials), this._takeRandom(materials)];
    }

    _takeRandom(arr: MaterialData[]) {
        const randIdx = Math.floor(Math.random() * arr.length);
        return arr.splice(randIdx, 1)[0];
    }
}
