import { Physics, Scene } from "phaser";
import BasePhysicsObject from "./BasePhysicsObject";
import Lane from "./Lane";
import BaseWizard from "./wizard/BaseWizard";
import Boulder from "./obstacles/Boulder";
import { HorizontalDirection } from "../config/Constants";

const SPEED = 1000;
const OFFSET_X = 10;
const OFFSET_Y = -10;
const TTL = 2000;

export default class BoltProjectile extends BasePhysicsObject {
    obstaclesCollider: Physics.Arcade.Collider;
    wizardsCollider: Physics.Arcade.Collider;

    constructor(
        scene: Scene,
        x: number,
        y: number,
        lane: Lane,
        public direction: HorizontalDirection,
        allWizards: BaseWizard[],
        onHitObstacle: (bolt: BoltProjectile, obstacle: Boulder) => void,
        onHitWizard: (bolt: BoltProjectile, wizard: BaseWizard) => void
    ) {
        super(scene, "boltProjectile");

        const laneObstaclesGroup = lane.obstaclesGroup;

        this.obstaclesCollider = scene.physics.add.collider(
            this,
            laneObstaclesGroup,
            (self: BoltProjectile, obstacle: Boulder) => {
                onHitObstacle(self, obstacle);
                this.destroy();
            }
        );
        this.wizardsCollider = scene.physics.add.collider(
            this,
            allWizards,
            (self: BoltProjectile, wizard: BaseWizard) => {
                onHitWizard(self, wizard);
                this.destroy();
            }
        );

        let dirMod = 1;
        if (direction === "left") {
            dirMod = -1;
            this.setFlipX(true);
        }
        this.setPosition(x + OFFSET_X * dirMod, y + OFFSET_Y);
        this.setVelocityX(SPEED * dirMod);
        this.setDepth(lane.index);
        this.body.setSize(this.body.width, 32);

        setTimeout(() => {
            try {
                this.destroy();
            } catch (err) {
                console.error(err);
            }
        }, TTL);
    }

    destroy(fromScene?: boolean): void {
        // if (this.obstaclesCollider != null) {
        //     this.obstaclesCollider.destroy();
        // }
        // if (this.wizardsCollider != null) {
        //     this.wizardsCollider.destroy();
        // }

        super.destroy(fromScene);
    }
}
