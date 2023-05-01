import { Input, Scene } from "phaser";
import BaseWizard from "./BaseWizard";
import Lane from "../Lane";
import { WizardCallbacks } from "./WizardCallbacks";
import KeyListenerBuilder from "../../utils/KeyListenerBuilder";

const KeyCodes = Phaser.Input.Keyboard.KeyCodes;

const MOVEUP_KEYBIND = KeyCodes.UP;
const MOVEDOWN_KEYBIND = KeyCodes.DOWN;
const MOVERIGHT_KEYBIND = KeyCodes.RIGHT;
const MOVELEFT_KEYBIND = KeyCodes.LEFT;

export default class PlayerWizard extends BaseWizard {
    keyListener: KeyListenerBuilder;

    constructor(
        scene: Scene,
        lane: Lane,
        laneX: number,
        speed: number,
        private callbacks: WizardCallbacks
    ) {
        super(scene, "wizard1", lane, laneX, speed);

        this.keyListener = new KeyListenerBuilder(scene)
            .add(MOVEUP_KEYBIND, () => callbacks.onMoveUp(this))
            .add(MOVEDOWN_KEYBIND, () => callbacks.onMoveDown(this))
            .add(
                MOVERIGHT_KEYBIND,
                keyObjects => {
                    const leftRunKey = keyObjects.get(MOVELEFT_KEYBIND);
                    if (leftRunKey.isUp) {
                        callbacks.onStartRun(this, "right");
                    } else {
                        callbacks.onStopRun(this);
                    }
                },
                keyObjects => {
                    const leftRunKey = keyObjects.get(MOVELEFT_KEYBIND);
                    if (leftRunKey.isUp) {
                        callbacks.onStopRun(this);
                    } else {
                        callbacks.onStartRun(this, "left");
                    }
                }
            )
            .add(
                MOVELEFT_KEYBIND,
                keyObjects => {
                    const rightRunKey = keyObjects.get(MOVERIGHT_KEYBIND);
                    if (rightRunKey.isUp) {
                        callbacks.onStartRun(this, "left");
                    } else {
                        callbacks.onStopRun(this);
                    }
                },
                keyObjects => {
                    const rightRunKey = keyObjects.get(MOVERIGHT_KEYBIND);
                    if (rightRunKey.isUp) {
                        callbacks.onStopRun(this);
                    } else {
                        callbacks.onStartRun(this, "right");
                    }
                }
            );
    }

    destroy(fromScene?: boolean): void {
        this.keyListener.destroy();
        super.destroy(fromScene);
    }

    unstun(): void {
        super.unstun();
        const leftRunKey = this.keyListener.keyObjects.get(MOVELEFT_KEYBIND);
        const rightRunKey = this.keyListener.keyObjects.get(MOVERIGHT_KEYBIND);
        if (leftRunKey.isDown && !rightRunKey.isDown) {
            this.callbacks.onStartRun(this, "left");
        } else if (!leftRunKey.isDown && rightRunKey.isDown) {
            this.callbacks.onStartRun(this, "right");
        }
    }
}
