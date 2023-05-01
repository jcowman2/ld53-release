import { GameObjects, Scene } from "phaser";
import SpellIcon from "../ui/spells/SpellIcon";
import {
    DEFAULT_TEXT_COLOR,
    FONT_FAMILY,
    LANES_COUNT,
    LANE_STARTING_Y,
    LANE_WIDTH,
    SCREEN_HEIGHT,
    SCREEN_WIDTH
} from "../config/Constants";
import {
    MATERIALS,
    MaterialCode,
    SPELLS,
    SpellType
} from "../ui/spells/SpellData";
import SpellcastDetails from "../ui/spells/SpellcastDetails";
import MaterialRow from "../ui/materials/MaterialRow";

const SPELL_TRAY_START_Y = LANE_STARTING_Y + LANE_WIDTH * LANES_COUNT;
const SPELL_TRAY_HEIGHT = SCREEN_HEIGHT - SPELL_TRAY_START_Y;
const SPELL_TRAY_COLOR = 0xffedbd;
const SPELL_ICONS_FRAME_Y = SCREEN_HEIGHT - 165;
const SPELL_ICONS_START_X = 40;
const SPELL_ICONS_GUTTER_X = 20;
const MATERIAL_TRAY_PAD_RIGHT = 40;
const MATERIAL_ROW_GUTTER_Y = 10;
const MATERIAL_ROW_GUTTER_X = 80;

export default class RacingOverlayScene extends Scene {
    order: [MaterialCode, MaterialCode];
    distanceToGoalText: GameObjects.Text | null;
    selectedSpell: SpellIcon | null = null;
    spellcastDetails: SpellcastDetails | null;

    materialCounts: Record<MaterialCode, number>;
    materialTrayRows: Record<MaterialCode, MaterialRow>;

    constructor() {
        super("RacingOverlayScene");
    }

    preload() {}

    create(order: [MaterialCode, MaterialCode]) {
        this.order = order;
        this.materialCounts = {
            D: 12,
            W: 12,
            L: 12,
            B: 12
        };

        this._drawSpellTray();
        this._drawMaterialsTray();

        this.events.on(
            "distancesUpdate",
            ({
                distanceToGoal,
                npcDistancesToGoal
            }: {
                distanceToGoal: number;
                npcDistancesToGoal: number[];
            }) => {
                try {
                    if (distanceToGoal < 0) {
                        this._onPlayerReachGoal(npcDistancesToGoal);
                        return;
                    }

                    const text = `${Math.floor(distanceToGoal / 60)}m to go`;
                    if (this.distanceToGoalText == null) {
                        this.distanceToGoalText = this.add.text(
                            SCREEN_WIDTH - 200,
                            200,
                            text,
                            {
                                color: DEFAULT_TEXT_COLOR,
                                fontSize: 32,
                                fontFamily: FONT_FAMILY
                            }
                        );
                    } else {
                        this.distanceToGoalText.setText(text);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        );

        this.events.once("shutdown", () => {
            this.events.removeAllListeners("distancesUpdate");
        });
    }

    update() {}

    _drawSpellTray() {
        this.add
            .rectangle(
                0,
                SPELL_TRAY_START_Y,
                SCREEN_WIDTH,
                SPELL_TRAY_HEIGHT,
                SPELL_TRAY_COLOR
            )
            .setOrigin(0, 0);

        let x = SPELL_ICONS_START_X;
        SPELLS.forEach((data, index) => {
            const hotkey = index + 1; // 1-indexing
            const icon = new SpellIcon(
                this,
                data.type,
                hotkey,
                x,
                SPELL_ICONS_FRAME_Y,
                this._onSpellHotkeyPressed
            );
            x = icon.getBounds().right + SPELL_ICONS_GUTTER_X;
        });
    }

    _onSpellHotkeyPressed = (spellIcon: SpellIcon) => {
        if (this.selectedSpell != null) {
            this._uncommitMaterials();
            this.selectedSpell.unhighlight();
            this.spellcastDetails.destroy();
        }
        if (spellIcon != this.selectedSpell) {
            spellIcon.highlight();
            this.selectedSpell = spellIcon;
            this._drawSpellcastDetails(spellIcon.spell);
        } else {
            this.selectedSpell = null;
        }
    };

    _drawSpellcastDetails = (spellType: SpellType) => {
        const spellData = SPELLS.find(data => data.type === spellType);
        this.spellcastDetails = new SpellcastDetails(
            this,
            spellData,
            this._onSpellcastKeyDown,
            this._onCast
        );
    };

    _drawMaterialsTray() {
        const counts = this.materialCounts;
        const materialsTray = this.add.container(0, 0);

        const [
            dragonflowerMaterial,
            lightningbugMaterial,
            wildgrassMaterial,
            basaltMaterial
        ] = MATERIALS;

        const dragonflowerRow = new MaterialRow(
            this,
            dragonflowerMaterial,
            counts.D
        );
        const dfRowBounds = dragonflowerRow.getBounds();

        const wildgrassRow = new MaterialRow(
            this,
            wildgrassMaterial,
            counts.W,
            0,
            dfRowBounds.bottom + MATERIAL_ROW_GUTTER_Y
        );
        const lightningbugRow = new MaterialRow(
            this,
            lightningbugMaterial,
            counts.L,
            dfRowBounds.right + MATERIAL_ROW_GUTTER_X
        );
        const basaltRow = new MaterialRow(
            this,
            basaltMaterial,
            counts.B,
            dfRowBounds.right + MATERIAL_ROW_GUTTER_X,
            dfRowBounds.bottom + MATERIAL_ROW_GUTTER_Y
        );

        materialsTray.add([
            dragonflowerRow,
            wildgrassRow,
            lightningbugRow,
            basaltRow
        ]);
        this.materialTrayRows = {
            D: dragonflowerRow,
            W: wildgrassRow,
            L: lightningbugRow,
            B: basaltRow
        };

        const trayBounds = materialsTray.getBounds();
        materialsTray.setPosition(
            SCREEN_WIDTH - trayBounds.width - MATERIAL_TRAY_PAD_RIGHT,
            SPELL_TRAY_START_Y + (SPELL_TRAY_HEIGHT - trayBounds.height) / 2
        );
    }

    _onSpellcastKeyDown = (
        code: MaterialCode,
        committedMaterials: MaterialCode[],
        recipe: MaterialCode[]
    ) => {
        const materialsNeeded = [...recipe];
        for (const committedMaterial of committedMaterials) {
            const removeIndex = materialsNeeded.findIndex(
                rCode => rCode === committedMaterial
            );
            materialsNeeded.splice(removeIndex, 1);
        }

        const indexToFill = materialsNeeded.findIndex(
            neededCode => neededCode === code
        );
        if (indexToFill === -1) {
            // That material isn't needed
            return;
        }

        const existingCount = this.materialCounts[code];

        if (existingCount === 0) {
            console.log("not enough");
            return;
        }

        this._changeMaterialCount(code, existingCount - 1);
        this.spellcastDetails.commitMaterial(code);
    };

    _changeMaterialCount = (code: MaterialCode, newCount: number) => {
        this.materialCounts[code] = newCount;
        this.materialTrayRows[code].updateCount(newCount);
    };

    _uncommitMaterials = () => {
        const committedMaterials =
            this.spellcastDetails.getCommittedMaterials();
        for (const material of committedMaterials) {
            const existingCount = this.materialCounts[material];
            this._changeMaterialCount(material, existingCount + 1);
        }
    };

    _onCast = (spell: SpellType) => {
        const emitter = this.scene.get("RacingScene").events;

        switch (spell) {
            case "dashSpell":
                emitter.emit("castDash");
                break;
            case "boltSpell":
                emitter.emit("castBolt");
                break;
            case "shieldSpell":
                emitter.emit("castShield");
                break;
        }

        this.spellcastDetails.destroy();
        this._drawSpellcastDetails(spell);
    };

    _onPlayerReachGoal = (npcDistancesToGoal: number[]) => {
        if (this.distanceToGoalText != null) {
            this.distanceToGoalText.destroy();
            this.distanceToGoalText = null;
        }
        const anyNpcsAlreadyHere = npcDistancesToGoal.some(dist => dist <= 0);
        this.scene.stop("RacingScene");
        // this.scene.get("RacingScene").scene.pause();
        this.scene.start("RaceEndScene", {
            won: !anyNpcsAlreadyHere,
            order: this.order,
            inventory: { ...this.materialCounts }
        });
    };
}
