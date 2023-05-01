import Phaser, { Game, Scale, Types } from "phaser";
import RacingScene from "../scenes/RacingScene";
import LoadScene from "../scenes/LoadScene";
import { SCREEN_HEIGHT, SCREEN_WIDTH, SKY_COLOR } from "./Constants";
import RacingOverlayScene from "../scenes/RacingOverlayScene";
import DeliveryRequestScene from "../scenes/DeliveryRequestScene";
import RaceEndScene from "../scenes/RaceEndScene";

const gameConfig: Types.Core.GameConfig = {
    title: "Arcana Express",
    type: Phaser.AUTO,
    parent: "game",
    backgroundColor: 0x000000,
    scale: {
        autoCenter: Scale.CENTER_BOTH,
        mode: Scale.FIT,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT
    },
    audio: {
        disableWebAudio: true
    },
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            fixedStep: true
        }
    },
    autoFocus: true,
    scene: [
        LoadScene,
        DeliveryRequestScene,
        RacingScene,
        RacingOverlayScene,
        RaceEndScene
    ]
};

new Game(gameConfig);
