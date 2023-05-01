import { Scene } from "phaser";
import Lane from "../Lane";
import BasePhysicsObject from "../BasePhysicsObject";
import { LANE_WIDTH } from "../../config/Constants";

export default class Boulder extends BasePhysicsObject {
    constructor(scene: Scene, lane: Lane, laneX: number) {
        super(scene, "boulder1");

        this.setImmovable(true);
        this.body.setSize(100, 70);
        this.body.setOffset(16, 64);

        lane.placeSpriteOn(this, laneX, LANE_WIDTH * 0.7);
    }
}
