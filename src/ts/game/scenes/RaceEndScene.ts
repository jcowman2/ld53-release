import { Input, Scene } from "phaser";
import { FONT_FAMILY, SCREEN_HEIGHT, SCREEN_WIDTH } from "../config/Constants";
import { MaterialCode } from "../ui/spells/SpellData";
import { getMaterialFromCode } from "../ui/spells/SpellData";
import KeyListenerBuilder from "../utils/KeyListenerBuilder";

const BG_COLOR = 0xffedbd;
const INK_COLOR = "#584619";

const STYLES = {
    fontFamily: FONT_FAMILY,
    fontSize: 48,
    color: INK_COLOR
};
const X_PAD = 100;

export default class RaceEndScene extends Scene {
    constructor() {
        super("RaceEndScene");
    }

    preload() {}

    create(data: {
        won: boolean;
        order: [MaterialCode, MaterialCode];
        inventory: Record<MaterialCode, number>;
    }) {
        const { won, order, inventory } = data;

        this.cameras.main.setBackgroundColor(BG_COLOR);
        if (won) {
            this._drawWon(order, inventory);
        } else {
            this._drawLost();
        }

        new KeyListenerBuilder(this).add(
            Input.Keyboard.KeyCodes.SPACE,
            () => {},
            () => {
                this.scene.start("DeliveryRequestScene", { retry: true });
            }
        );
    }

    update() {}

    _drawWon(
        order: [MaterialCode, MaterialCode],
        inventory: Record<MaterialCode, number>
    ) {
        this.add.text(X_PAD, 120, "Delivery Complete!", {
            ...STYLES,
            fontSize: 86
        });
        this.add.text(
            X_PAD,
            260,
            "Reaching the market first, you sold the following items:",
            STYLES
        );
        const center_x = SCREEN_WIDTH / 2;

        const [code1, code2] = order;
        const material1 = getMaterialFromCode(code1);
        const count1 = inventory[code1];
        const name1 = count1 === 1 ? material1.name : material1.plural;
        const scoreMod1 = 100;
        const totalScore1 = count1 * scoreMod1;
        const m1Str = `${count1} ${name1}: +${totalScore1} points`;

        this.add
            .text(center_x, 365, m1Str, {
                ...STYLES,
                fontSize: 64
            })
            .setOrigin(0.5);

        const material2 = getMaterialFromCode(code2);
        const count2 = inventory[code2];
        const name2 = count2 === 1 ? material2.name : material2.plural;
        const scoreMod2 = 50;
        const totalScore2 = count2 * scoreMod2;
        const m2Str = `${count2} ${name2}: +${totalScore2} points`;

        this.add
            .text(center_x, 450, m2Str, {
                ...STYLES,
                fontSize: 64
            })
            .setOrigin(0.5);

        this.add
            .text(center_x, 600, `Total Score: ${totalScore1 + totalScore2}`, {
                ...STYLES,
                fontSize: 92
            })
            .setOrigin(0.5);

        this.add
            .text(
                X_PAD,
                SCREEN_HEIGHT - 200,
                "Thank you for playing! Press SPACE to play again.",
                STYLES
            )
            .setAlpha(0.8);
    }

    _drawLost() {
        this.add.text(X_PAD, 120, "Delivery Failed.", {
            ...STYLES,
            fontSize: 86
        });
        const text = this.add.text(
            X_PAD,
            260,
            "Another merchant beat you to the market and nobody wants to buy anything else. Better luck next time.",
            STYLES
        );
        text.setWordWrapWidth(SCREEN_WIDTH - 200);

        this.add
            .text(
                X_PAD,
                SCREEN_HEIGHT - 200,
                "Press SPACE to try again!",
                STYLES
            )
            .setAlpha(0.8);
    }
}
