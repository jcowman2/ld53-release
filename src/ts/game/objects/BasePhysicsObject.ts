import { Geom, Physics, Scene } from "phaser";

const DEBUG_BODY_RECT = false;

export default class BasePhysicsObject extends Physics.Arcade.Sprite {
    constructor(scene: Scene, key: string) {
        super(scene, 0, 0, key);

        this.setOrigin(0.5, 1); // Sets origin to bottom-center of sprite
        scene.add.existing(this);

        scene.physics.add.existing(this);
    }

    getBodyRect(): Geom.Rectangle {
        const boundingBoxTopLeftX =
            this.x - this.width / 2 + this.body.offset.x;
        const boundingBoxTopLeftY = this.y - this.height + this.body.offset.y;
        const boundingBoxWidth = this.body.width;
        const boundingBoxHeight = this.body.height;

        if (DEBUG_BODY_RECT) {
            console.log({
                thisX: this.x,
                thisY: this.y,
                offsetX: this.body.offset.x,
                offsetY: this.body.offset.y,
                width: this.width,
                height: this.height,
                bodyHalfWidth: this.body.halfWidth,
                bodyHeight: this.body.height
            });

            this.scene.add
                .circle(boundingBoxTopLeftX, boundingBoxTopLeftY, 3, 0x00ff00)
                .setDepth(10);

            this.scene.add
                .rectangle(
                    boundingBoxTopLeftX,
                    boundingBoxTopLeftY,
                    boundingBoxWidth,
                    boundingBoxHeight,
                    0x0000ff
                )
                .setOrigin(0, 0);
        }

        return new Geom.Rectangle(
            boundingBoxTopLeftX,
            boundingBoxTopLeftY,
            boundingBoxWidth,
            boundingBoxHeight
        );
    }
}
