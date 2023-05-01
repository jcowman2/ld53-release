import { Scene } from "phaser";
import {
    HorizontalDirection,
    LANE_COLORS,
    LANE_STARTING_Y,
    LANE_WIDTH,
    SCREEN_HEIGHT,
    SKY_COLOR
} from "../config/Constants";
import Lane from "../objects/Lane";
import PlayerWizard from "../objects/wizard/PlayerWizard";
import BaseWizard from "../objects/wizard/BaseWizard";
import Boulder from "../objects/obstacles/Boulder";
import NpcWizard from "../objects/wizard/NpcWizard";
import { WizardCallbacks } from "../objects/wizard/WizardCallbacks";
import BoltProjectile from "../objects/BoltProjectile";

const PLAYER_MOVEMENT_SPEED = 300;
const NPC_MOVEMENT_SPEED = 350;
const NPC_MOVEMENT_SPEED_VARIANCE = 50;
const CAMERA_TRACK_LERP = 0.05;
const WORLD_WIDTH = 10000;
const OBSTACLE_STARTING_X = 200;
const OBSTACLE_ENDING_X = WORLD_WIDTH - 500;
const OBSTACLE_OFFSET_X = 200;
const OBSTACLE_RANGE_X = 1000;
const GOAL_OFFSET_LEFT = 100;
const GOAL_X = WORLD_WIDTH - GOAL_OFFSET_LEFT;

const DEFAULT_NPC_SPELLCAST_RATE = 1 / 5;
const DEFAULT_NPC_AGGRESSIVENESS = 0.6;
const NPC_REFLEX = 1 / 4;

type NpcConfig = {
    key: "wizard2" | "wizard3" | "wizard4";
    laneX: number;
    spellcastRate?: number;
    aggressiveness?: number;
};

const NPC_PARAMS: NpcConfig[] = [
    {
        key: "wizard2",
        laneX: 150,
        spellcastRate: 1 / 5,
        aggressiveness: 0.25
    },
    {
        key: "wizard3",
        laneX: 100,
        spellcastRate: 1 / 4
    },
    {
        key: "wizard4",
        laneX: 150,
        spellcastRate: 1 / 6,
        aggressiveness: 0.8
    }
];

export default class RacingScene extends Scene {
    lanes: Lane[];
    playerWizard: PlayerWizard;
    npcWizards: NpcWizard[];

    constructor() {
        super("RacingScene");
    }

    preload() {
        this.lanes = [];
        this.npcWizards = [];
    }

    create() {
        this._drawLanes();
        this._drawWizards();
        this._placeObstacles();
        this._setupCameras();

        this.events.on("castDash", () => {
            this._onWizardCastDash(this.playerWizard);
        });
        this.events.on("castBolt", () => {
            this._onWizardCastBolt(this.playerWizard);
        });
        this.events.on("castShield", () => {
            this._onWizardCastShield(this.playerWizard);
        });
    }

    update(time: number) {
        this.npcWizards.forEach(wizard => {
            wizard.tickForSpellcasting(
                time,
                this._onWizardCastDash,
                this._onWizardCastBolt
            );
        });
        this._checkDistances();
    }

    _drawLanes() {
        let index = 0;
        let y = LANE_STARTING_Y;
        for (const laneColor of LANE_COLORS) {
            this.lanes.push(new Lane(this, index, y, WORLD_WIDTH, laneColor));
            index++;
            y += LANE_WIDTH;
        }
    }

    _drawWizards() {
        const callbacks: WizardCallbacks = {
            onMoveUp: this._onWizardMoveUp,
            onMoveDown: this._onWizardMoveDown,
            onStartRun: this._onWizardStartRun,
            onStopRun: this._onWizardStopRun,
            getAllLanes: () => this.lanes
        };

        this.playerWizard = new PlayerWizard(
            this,
            this.lanes[0],
            100,
            PLAYER_MOVEMENT_SPEED,
            callbacks
        );

        this.npcWizards = NPC_PARAMS.map((config, index) => {
            const {
                key,
                laneX,
                spellcastRate = DEFAULT_NPC_SPELLCAST_RATE,
                aggressiveness = DEFAULT_NPC_AGGRESSIVENESS
            } = config;
            return new NpcWizard(
                this,
                key,
                this.lanes[index + 1],
                laneX,
                this._generateNpcMovementSpeed(),
                spellcastRate,
                aggressiveness,
                callbacks
            );
        });
    }

    _generateNpcMovementSpeed() {
        const variance = Math.random() * NPC_MOVEMENT_SPEED_VARIANCE;
        const offset = NPC_MOVEMENT_SPEED_VARIANCE / 2;
        return NPC_MOVEMENT_SPEED + variance - offset;
    }

    _placeObstacles() {
        for (const lane of this.lanes) {
            this._placeObstaclesInLane(lane);
        }
    }

    _placeObstaclesInLane(lane: Lane) {
        const boulders: Boulder[] = [];
        let x = OBSTACLE_STARTING_X;
        x += Math.random() * OBSTACLE_RANGE_X;
        while (x < OBSTACLE_ENDING_X) {
            boulders.push(new Boulder(this, lane, x));
            x += Math.random() * OBSTACLE_RANGE_X + OBSTACLE_OFFSET_X;
        }

        lane.createObstaclesGroup(boulders);
        this.playerWizard.createLaneObstaclesCollider(lane);
        for (const npc of this.npcWizards) {
            npc.createLaneObstaclesCollider(lane, (_wizard, boulder) => {
                npc.onHitObstacle(boulder);
            });
        }
    }

    _setupCameras() {
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, SCREEN_HEIGHT);
        this.cameras.main.setBackgroundColor(SKY_COLOR);
        this.physics.world.setBounds(
            0,
            -SCREEN_HEIGHT,
            WORLD_WIDTH,
            SCREEN_HEIGHT * 2,
            true, // checkLeft
            true, // checkRight
            false, // checkUp
            false // checkDown
        );
        this.cameras.main.startFollow(
            this.playerWizard,
            true,
            CAMERA_TRACK_LERP,
            CAMERA_TRACK_LERP
        );
    }

    _attemptWizardLaneChange(wizard: BaseWizard, newLane: Lane) {
        const moved = wizard.attemptMoveToLane(newLane);
        if (moved && wizard.movingDirection != null) {
            this._onWizardStartRun(wizard, wizard.movingDirection);
        }
    }

    _onWizardMoveUp = (wizard: BaseWizard) => {
        if (wizard.isStunned) {
            return;
        }

        const currentLaneIndex = wizard.lane.index;
        if (currentLaneIndex > 0) {
            const newlaneIndex = currentLaneIndex - 1;
            const newLane = this.lanes[newlaneIndex];
            this._attemptWizardLaneChange(wizard, newLane);
        }
    };

    _onWizardMoveDown = (wizard: BaseWizard) => {
        if (wizard.isStunned) {
            return;
        }

        const currentLaneIndex = wizard.lane.index;
        if (currentLaneIndex < this.lanes.length - 1) {
            const newlaneIndex = currentLaneIndex + 1;
            const newLane = this.lanes[newlaneIndex];
            this._attemptWizardLaneChange(wizard, newLane);
        }
    };

    _onWizardStartRun = (
        wizard: BaseWizard,
        direction: HorizontalDirection
    ) => {
        if (wizard.isStunned) {
            return;
        }

        const directionModifier = direction === "right" ? 1 : -1;
        wizard.setVelocityX(wizard.speed * directionModifier);
        wizard.movingDirection = direction;
        if (direction !== wizard.spriteFacing) {
            wizard.turnAround();
        }
    };

    _onWizardStopRun = (wizard: BaseWizard) => {
        wizard.setVelocityX(0);
        wizard.movingDirection = null;
    };

    _onWizardCastDash = (wizard: BaseWizard) => {
        wizard.dash(
            () => {
                this._onWizardStartRun(wizard, wizard.movingDirection);
            },
            () => {
                this._onWizardStartRun(wizard, wizard.movingDirection);
            }
        );
    };

    _onWizardCastBolt = (wizard: BaseWizard) => {
        const wizardTargets = [this.playerWizard, ...this.npcWizards];
        const thisWizardIndex = wizardTargets.findIndex(w => w === wizard);
        wizardTargets.splice(thisWizardIndex, 1);

        new BoltProjectile(
            this,
            wizard.x,
            wizard.y,
            wizard.lane,
            wizard.spriteFacing,
            wizardTargets,
            this._onBoltHitsObstacle,
            this._onBoltHitsWizard
        );

        this._checkIfNpcsInLaneCastShield(wizard, wizard.lane);
    };

    _onBoltHitsObstacle = (_bolt: BoltProjectile, boulder: Boulder) => {
        boulder.destroy();
    };

    _onBoltHitsWizard = (_bolt: BoltProjectile, wizard: BaseWizard) => {
        const gotStunned = wizard.stun();
        if (gotStunned) {
            this._onWizardStopRun(wizard);
        }
    };

    _onWizardCastShield = (wizard: BaseWizard) => {
        wizard.shield();
    };

    _checkIfNpcsInLaneCastShield = (wizard: BaseWizard, lane: Lane) => {
        const npcsInLane = this.npcWizards.filter(
            npc => npc.lane === lane && npc !== wizard
        );
        if (npcsInLane.length === 0) {
            return;
        }
        for (const npc of npcsInLane) {
            const randVal = Math.random();
            if (randVal < NPC_REFLEX) {
                this._onWizardCastShield(npc);
            }
        }
    };

    _checkDistances() {
        const playerX = this.playerWizard.x;
        const playerDistanceToGoal = GOAL_X - playerX;

        const npcDistancesToGoal = this.npcWizards.map(npc => {
            const npcDistanceToGoal = GOAL_X - npc.x;
            return npcDistanceToGoal;
        });

        this.scene.get("RacingOverlayScene").events.emit("distancesUpdate", {
            distanceToGoal: playerDistanceToGoal,
            npcDistancesToGoal
        });
    }
}
