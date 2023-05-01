import { HorizontalDirection } from "../../config/Constants";
import Lane from "../Lane";
import BaseWizard from "./BaseWizard";

export type WizardCallback = (self: BaseWizard) => void;
export type WizardCallbacks = {
    onMoveUp: WizardCallback;
    onMoveDown: WizardCallback;
    onStartRun: (wizard: BaseWizard, direction: HorizontalDirection) => void;
    onStopRun: WizardCallback;

    getAllLanes: () => Lane[];
};
