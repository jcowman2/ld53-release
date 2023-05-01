import { Input, Scene } from "phaser";
import { FONT_FAMILY, SCREEN_HEIGHT, SCREEN_WIDTH } from "../config/Constants";
import KeyListenerBuilder from "../utils/KeyListenerBuilder";

export default class LoadScene extends Scene {
    constructor() {
        super("LoadScene");
    }

    preload() {
        this.load.path = "assets/sprites/";
        this.load.image("wizard1", "Wizard1_Export1.png");
        this.load.image("wizard2", "Wizard2_Export1.png");
        this.load.image("wizard3", "Wizard3_Export1.png");
        this.load.image("wizard4", "Wizard4_Export1.png");
        this.load.image("boulder1", "Boulder1_Export1.png");
        this.load.image("frame", "Frame1_Export1.png");
        this.load.image("boltSpell", "BoltSpell_Export1.png");
        this.load.image("dashSpell", "DashSpell_Export1.png");
        this.load.image("shieldSpell", "ShieldSpell_Export1.png");
        this.load.image("boltProjectile", "BoltProjectile_Export1.png");
        this.load.image("key", "Key_Export2.png");
        this.load.image("spaceKey", "SpaceKey_Export1.png");
        this.load.image("plus", "Plus_Export1.png");
        this.load.image("dragonflower", "Dragonflower_Export1.png");
        this.load.image("lightningbug", "LightningBug_Export1.png");
        this.load.image("wildgrass", "WildGrass_Export1.png");
        this.load.image("basalt", "Basalt_Export1.png");
    }

    create() {
        const title = this.add
            .text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 200, "ARCANA EXPRESS", {
                fontFamily: FONT_FAMILY,
                fontSize: 112
            })
            .setOrigin(0.5);

        const byText = this.add
            .text(title.x, title.y + 100, "A game by Joe Cowman", {
                fontFamily: FONT_FAMILY,
                fontSize: 32
            })
            .setOrigin(0.5);

        const ldText = this.add
            .text(
                byText.x,
                byText.y + 30,
                'Created in 48 hours for Ludum Dare 53, "Delivery"',
                {
                    fontFamily: FONT_FAMILY,
                    fontSize: 32
                }
            )
            .setOrigin(0.5);

        this.add
            .text(ldText.x, ldText.y + 200, "Press SPACE to play!", {
                fontFamily: FONT_FAMILY,
                fontSize: 32
            })
            .setOrigin(0.5);

        new KeyListenerBuilder(this).add(
            Input.Keyboard.KeyCodes.SPACE,
            () => {},
            () => {
                this.scene.start("DeliveryRequestScene");
            }
        );
    }

    update() {}
}
