import { Geom, Physics, Scene } from "phaser";
import Lane from "../Lane";
import { HorizontalDirection, LANE_WIDTH } from "../../config/Constants";
import Boulder from "../obstacles/Boulder";
import BasePhysicsObject from "../BasePhysicsObject";

const Y_OFFSET_IN_LANE = LANE_WIDTH * 0.7;
const COLLIDER_WIDTH = 32;
const COLLIDER_HEIGHT = 100;
const COLLIDER_OFFSET_X_RIGHT = 58;
const COLLIDER_OFFSET_X_LEFT = 40;
const COLLIDER_OFFSET_Y = 28;
const STUN_DURATION = 2000;
const SHIELD_DURATION = 8000;
const DASH_INCREASE = 300;
const DASH_DURATION = 3000;

export default class BaseWizard extends BasePhysicsObject {
    public spriteFacing: HorizontalDirection = "right";
    public movingDirection: HorizontalDirection | null = null;
    public baseSpeed: number;

    public isDashing = false;
    public isShielded = false;
    public isStunned = false;

    public laneObstaclesColliderMap = new Map<
        number,
        Physics.Arcade.Collider
    >();

    destinationTester: BasePhysicsObject;

    constructor(
        scene: Scene,
        key: "wizard1" | "wizard2" | "wizard3" | "wizard4",
        public lane: Lane,
        laneX: number,
        public speed: number
    ) {
        super(scene, key);
        this.baseSpeed = speed;

        this.setCollideWorldBounds(true);

        this._createDestinationTester();
        this._setColliderSize();
        this._setColliderOffset(COLLIDER_OFFSET_X_RIGHT);
        this._placeOnLane(lane, laneX);

        this.setPushable(false);
    }

    _placeOnLane(lane: Lane, laneX?: number) {
        lane.placeSpriteOn(this, laneX, Y_OFFSET_IN_LANE);
        this.lane = lane;
    }

    _createDestinationTester() {
        const tester = new BasePhysicsObject(this.scene, "wizard1");
        tester.setVisible(false);
        tester.setActive(false);

        this.destinationTester = tester;
    }

    _setColliderSize() {
        this.body.setSize(COLLIDER_WIDTH, COLLIDER_HEIGHT);
        this.destinationTester.body.setSize(COLLIDER_WIDTH, COLLIDER_HEIGHT);
    }

    _setColliderOffset(x: number) {
        this.body.setOffset(x, COLLIDER_OFFSET_Y);
        this.destinationTester.body.setOffset(x, COLLIDER_OFFSET_Y);
    }

    _changeActiveObstaclesCollider(previousLane: Lane, newLane: Lane) {
        const previousObstaclesCollider = this.laneObstaclesColliderMap.get(
            previousLane.index
        );
        if (previousObstaclesCollider != null) {
            previousObstaclesCollider.active = false;
        }

        const newObstaclesCollider = this.laneObstaclesColliderMap.get(
            newLane.index
        );
        if (newObstaclesCollider != null) {
            newObstaclesCollider.active = true;
        }
    }

    canMoveToLane(lane: Lane) {
        const obstacles = lane.obstaclesGroup;
        if (obstacles == null) {
            return true;
        }

        lane.placeSpriteOn(
            this.destinationTester,
            this.x - lane.x, // laneX
            Y_OFFSET_IN_LANE
        );
        const testerRect = this.destinationTester.getBodyRect();

        this.destinationTester.setActive(true);
        const anyObstaclesIntersect = obstacles
            .getChildren()
            .some((boulder: Boulder) => {
                const obstacleRect = boulder.getBodyRect();
                const intersects = Geom.Intersects.RectangleToRectangle(
                    testerRect,
                    obstacleRect
                );
                return intersects;
            });
        this.destinationTester.setActive(false);
        return !anyObstaclesIntersect;
    }

    attemptMoveToLane(lane: Lane): boolean {
        const canMove = this.canMoveToLane(lane);
        if (!canMove) {
            return false;
        }

        this._changeActiveObstaclesCollider(this.lane, lane);
        this._placeOnLane(lane);
        return true;
    }

    createLaneObstaclesCollider(
        lane: Lane,
        callback: (wizard: BaseWizard, obstacle: Boulder) => void = () => {}
    ) {
        const obstaclesCollider = this.scene.physics.add.collider(
            this,
            lane.obstaclesGroup,
            callback
        );
        obstaclesCollider.active = lane === this.lane;
        this.laneObstaclesColliderMap.set(lane.index, obstaclesCollider);
    }

    turnAround() {
        if (this.spriteFacing === "right") {
            this.setFlipX(true);
            this.spriteFacing = "left";
            this._setColliderOffset(COLLIDER_OFFSET_X_LEFT);
        } else {
            this.setFlipX(false);
            this.spriteFacing = "right";
            this._setColliderOffset(COLLIDER_OFFSET_X_RIGHT);
        }
    }

    dash(onStartDash: () => void, onEndDash: () => void) {
        this.isDashing = true;

        this.speed += DASH_INCREASE;
        this.setTint(0xffff00);

        setTimeout(() => {
            try {
                this.endDash();
                onEndDash();
            } catch (err) {
                console.error(err);
            }
        }, DASH_DURATION);

        onStartDash();
    }

    endDash() {
        this.isDashing = false;
        this.speed = this.baseSpeed;
        this.clearTint();
    }

    stun() {
        if (this.isShielded) {
            return false;
        }

        this.isStunned = true;
        this.setTintFill(0xffffff);
        setTimeout(() => {
            try {
                this.unstun();
            } catch (err) {
                console.error(err);
            }
        }, STUN_DURATION);
        return true;
    }

    unstun() {
        this.isStunned = false;
        this.clearTint();
    }

    shield() {
        this.isShielded = true;
        this.setTintFill(0x3b2e2b);
        setTimeout(() => {
            try {
                this.unshield();
            } catch (err) {
                console.error(err);
            }
        }, SHIELD_DURATION);
    }

    unshield() {
        this.isShielded = false;
        this.clearTint();
    }
}
