import { Input, Scene } from "phaser";

export default class KeyListenerBuilder {
    keyObjects = new Map<string | number, Input.Keyboard.Key>();

    constructor(private scene: Scene) {}

    add(
        key: string | number,
        onKeyDown: (
            keyObjects: Map<string | number, Input.Keyboard.Key>
        ) => void,
        onKeyUp?: (keyObjects: Map<string | number, Input.Keyboard.Key>) => void
    ): this {
        const keyObj = this.scene.input.keyboard.addKey(key);
        keyObj.on("down", () => onKeyDown(this.keyObjects));
        if (onKeyUp != null) {
            keyObj.on("up", () => onKeyUp(this.keyObjects));
        }

        this.keyObjects.set(key, keyObj);
        return this;
    }

    destroy() {
        for (const keyObject of this.keyObjects.values()) {
            keyObject.removeAllListeners();
        }
    }
}
