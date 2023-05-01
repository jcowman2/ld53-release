export type SpellType = "boltSpell" | "dashSpell" | "shieldSpell";

export type MaterialType =
    | "wildgrass"
    | "lightningbug"
    | "dragonflower"
    | "basalt";

export type MaterialCode = "W" | "L" | "D" | "B";

export type SpellData = {
    type: SpellType;
    name: string;
    description: string;
    recipe: MaterialCode[];
};

export type MaterialData = {
    type: MaterialType;
    name: string;
    plural: string;
    code: MaterialCode;
};

export const SPELLS: SpellData[] = [
    {
        type: "dashSpell",
        name: "Dash",
        description: "Propel yourself with a burst of speed!",
        recipe: ["W", "W", "L"]
    },
    {
        type: "boltSpell",
        name: "Bolt",
        description: "Fire a mighty blast of energy!",
        recipe: ["D", "D", "L"]
    },
    {
        type: "shieldSpell",
        name: "Shieldskin",
        description: "Cover your skin in a tough shell of stone!",
        recipe: ["B", "B"]
    }
];

export const MATERIALS: MaterialData[] = [
    {
        type: "dragonflower",
        name: "Dragonflower",
        plural: "Dragonflowers",
        code: "D"
    },
    {
        type: "lightningbug",
        name: "Lightning Bug",
        plural: "Lightning Bugs",
        code: "L"
    },
    {
        type: "wildgrass",
        name: "Wild Grass",
        plural: "Wild Grass",
        code: "W"
    },
    {
        type: "basalt",
        name: "Basalt",
        plural: "Basalt",
        code: "B"
    }
];

export const getMaterialFromCode = (code: MaterialCode) => {
    switch (code) {
        case "D":
            return MATERIALS[0];
        case "L":
            return MATERIALS[1];
        case "W":
            return MATERIALS[2];
        case "B":
            return MATERIALS[3];
    }
};
