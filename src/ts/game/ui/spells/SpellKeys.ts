import { GameObjects, Scene } from "phaser";
import { MaterialCode, getMaterialFromCode } from "./SpellData";
import { DEFAULT_TEXT_COLOR, FONT_FAMILY } from "../../config/Constants";
import KeyListenerBuilder from "../../utils/KeyListenerBuilder";

export default class SpellKeys extends GameObjects.Container {
    keyListeners: KeyListenerBuilder;
    public committedMaterials: MaterialCode[] = [];
    keyImages: GameObjects.Image[] = [];
    materialIcons: GameObjects.Image[] = [];

    constructor(
        scene: Scene,
        public recipe: MaterialCode[],
        onKeyDown: (
            code: MaterialCode,
            committedMaterials: MaterialCode[],
            recipe: MaterialCode[]
        ) => void
    ) {
        super(scene, 0, 0);
        this._drawKeys();

        this.keyListeners = new KeyListenerBuilder(scene);
        const recipeUniqueValues = new Set(recipe);
        for (const code of recipeUniqueValues) {
            this.keyListeners.add(code, () =>
                onKeyDown(code, this.committedMaterials, recipe)
            );
        }
    }

    destroy(fromScene?: boolean): void {
        this.keyListeners.destroy();
        super.destroy(fromScene);
    }

    _drawKeys() {
        const images: (GameObjects.Image | GameObjects.Text)[] = [];
        this.recipe.forEach((materialCode, index) => {
            let x = 0;
            if (images.length > 0) {
                const lastElem = images[images.length - 1];
                x = lastElem.getRightCenter().x + 10;
            }
            const key = new GameObjects.Image(
                this.scene,
                x,
                0,
                "key"
            ).setOrigin(0, 0);

            const keyHalfWidth = key.getBounds().width / 2;
            const keyLabel = new GameObjects.Text(
                this.scene,
                x + keyHalfWidth,
                keyHalfWidth,
                materialCode,
                {
                    color: DEFAULT_TEXT_COLOR,
                    fontSize: 72,
                    fontFamily: FONT_FAMILY
                }
            ).setOrigin(0.5, 0.5);

            const material = getMaterialFromCode(materialCode);
            const materialIcon = new GameObjects.Image(
                this.scene,
                x + keyHalfWidth,
                keyHalfWidth * 2 + 50,
                material.type
            )
                .setScale(0.5, 0.5)
                .setAlpha(0.7);

            images.push(key, keyLabel, materialIcon);
            this.keyImages.push(key);
            this.materialIcons.push(materialIcon);

            if (index < this.recipe.length - 1) {
                const keyRightCenter = key.getRightCenter();
                x = keyRightCenter.x + 10;
                const plus = new GameObjects.Image(
                    this.scene,
                    x,
                    keyRightCenter.y,
                    "plus"
                )
                    .setOrigin(0, 0.5)
                    .setScale(0.5, 0.5)
                    .setAlpha(0.5);
                images.push(plus);
            }
        });

        this.add(images);
    }

    commitMaterial(code: MaterialCode) {
        let alreadyCommittedCount = 0;
        for (const committedMaterial of this.committedMaterials) {
            if (committedMaterial === code) {
                alreadyCommittedCount++;
            }
        }

        let toSkipCount = alreadyCommittedCount;
        let keyIndex;
        for (
            let recipeIndex = 0;
            recipeIndex < this.recipe.length;
            recipeIndex++
        ) {
            const recipeMaterial = this.recipe[recipeIndex];

            if (recipeMaterial === code) {
                toSkipCount--;
            }
            if (toSkipCount < 0) {
                keyIndex = recipeIndex;
                break;
            }
        }

        if (keyIndex == null) {
            console.error("Did not find key to commit material");
            return;
        }

        this.committedMaterials.push(code);
        this.materialIcons[keyIndex].setVisible(false);

        const material = getMaterialFromCode(code);
        const keyImage = this.keyImages[keyIndex];
        keyImage.setAlpha(0.5);
        const placedMaterialImage = new GameObjects.Image(
            this.scene,
            keyImage.x,
            keyImage.y,
            material.type
        ).setOrigin(0, 0);
        this.add(placedMaterialImage);
    }
}
