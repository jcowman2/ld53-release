import { GameObjects, Physics, Scene } from "phaser";
import { LANE_WIDTH, SCREEN_WIDTH } from "../config/Constants";
import Boulder from "./obstacles/Boulder";

export default class Lane extends GameObjects.Container {
    public obstaclesGroup: Physics.Arcade.Group;

    constructor(
        scene: Scene,
        public index: number,
        y: number,
        width: number,
        color: number
    ) {
        super(scene, 0, y);
        this.add(
            new GameObjects.Rectangle(
                scene,
                0,
                0,
                width,
                LANE_WIDTH,
                color
            ).setOrigin(0, 0)
        );
        scene.add.existing(this);
    }

    placeSpriteOn(
        sprite: GameObjects.Sprite,
        x?: number,
        y: number = LANE_WIDTH / 2
    ) {
        sprite.setY(this.y + y);
        if (x != null) {
            sprite.setX(this.x + x);
        }

        sprite.depth = this.index;
    }

    createObstaclesGroup(obstacles: Boulder[]) {
        this.obstaclesGroup = this.scene.physics.add.group(obstacles);
        this.obstaclesGroup.children.iterate((boulder: Boulder) => {
            boulder.setImmovable(true);
            return true;
        });
    }
}
