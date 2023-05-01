import { Scene } from "phaser";
import BaseWizard from "./BaseWizard";
import Lane from "../Lane";
import { WizardCallback, WizardCallbacks } from "./WizardCallbacks";
import Boulder from "../obstacles/Boulder";

const RUN_BACK_FOR_MIN_DURATION = 500;
const RUN_BACK_FOR_DURATION_VARIANCE = 1000;

export default class NpcWizard extends BaseWizard {
    timeToCastNextSpell: number;

    constructor(
        scene: Scene,
        key: "wizard2" | "wizard3" | "wizard4",
        lane: Lane,
        laneX: number,
        speed: number,
        private spellcastRate: number,
        private aggressiveness: number,
        private callbacks: WizardCallbacks
    ) {
        super(scene, key, lane, laneX, speed);

        callbacks.onStartRun(this, "right");
    }

    onHitObstacle(_obstacle: Boulder) {
        const moved = this._moveToRandomUnblockedLane();
        if (!moved) {
            this._tryToGetUnstuck();
        }
    }

    unstun() {
        super.unstun();
        this.callbacks.onStartRun(this, "right");
    }

    _moveToRandomUnblockedLane(): boolean {
        const lanesToTest = this._getLanesToTryAndMoveTo();
        const lanesToTestCount = lanesToTest.length;

        for (let i = 0; i < lanesToTestCount; i++) {
            const lane = this._pickRandomLane(lanesToTest);
            const canMove = this.canMoveToLane(lane);
            if (canMove) {
                if (lane.index < this.lane.index) {
                    this.callbacks.onMoveUp(this);
                } else {
                    this.callbacks.onMoveDown(this);
                }
                return true;
            }
        }
        return false;
    }

    _getLanesToTryAndMoveTo() {
        const laneIndex = this.lane.index;
        const allLanes = this.callbacks.getAllLanes();
        let lanesToTest: Lane[];
        if (laneIndex === 0) {
            lanesToTest = [allLanes[1]];
        } else if (laneIndex === allLanes.length - 1) {
            lanesToTest = [allLanes[laneIndex - 1]];
        } else {
            const upLane = allLanes[laneIndex - 1];
            const downLane = allLanes[laneIndex + 1];
            lanesToTest = [upLane, downLane];
        }
        return lanesToTest;
    }

    _pickRandomLane(laneOptions: Lane[]): Lane {
        let lane: Lane;
        if (laneOptions.length === 1) {
            lane = laneOptions.shift();
        } else {
            const randIndex = Math.floor(Math.random() * laneOptions.length);
            lane = laneOptions.splice(randIndex, 1)[0];
        }
        return lane;
    }

    _tryToGetUnstuck() {
        this.callbacks.onStartRun(this, "left");
        const runBackForDuration =
            RUN_BACK_FOR_MIN_DURATION +
            Math.random() * RUN_BACK_FOR_DURATION_VARIANCE;

        setTimeout(() => {
            try {
                this.callbacks.onStartRun(this, "right");
                this._moveToRandomUnblockedLane();
            } catch (err) {
                console.error(err);
            }
        }, runBackForDuration);
    }

    tickForSpellcasting(
        time: number,
        onCastDash: WizardCallback,
        onCastBolt: WizardCallback
    ) {
        if (this.spellcastRate <= 0) {
            return;
        }

        if (this.timeToCastNextSpell == null) {
            this.timeToCastNextSpell = this._getNextSpellcastingTime(time);
            return;
        }

        if (time >= this.timeToCastNextSpell && !this.isStunned) {
            this._cast(onCastDash, onCastBolt);
            this.timeToCastNextSpell = this._getNextSpellcastingTime(time);
            return;
        }
    }

    _getNextSpellcastingTime(currentTime: number) {
        let secondsToWait = 1;
        while (true) {
            const randValue = Math.random();
            if (randValue < this.spellcastRate) {
                break;
            } else {
                secondsToWait++;
            }
        }

        return currentTime + secondsToWait * 1000;
    }

    _cast(onCastDash: WizardCallback, onCastBolt: WizardCallback) {
        const randValue = Math.random();
        if (this.isDashing || randValue <= this.aggressiveness) {
            onCastBolt(this);
            return;
        }

        onCastDash(this);
        return;
    }
}
