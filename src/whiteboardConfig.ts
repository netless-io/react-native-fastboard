import type { Appliance } from "@netless/whiteboard-bridge-types";
import type { AppliancePair } from "./store/panelStateStore";

export function isShape(appliance: Appliance) {
    switch (appliance) {
        case 'shape': return true;
        case 'rectangle': return true;
        case 'straight': return true;
        case 'arrow': return true;
        case 'ellipse': return true;
        default:
            return false;
    }
}

export const branColor = '#3381ff';
export const defaultColors: string[] = [
    "#EC3455",
    "#F5AD46",
    "#68AB5D",
    "#32C5FF",
    "#005BF6",
    "#6236FF",
    "#9E51B6",
    "#6D7278",
];

export const shapes: AppliancePair[] = [
    { appliance: 'rectangle', shape: undefined },
    { appliance: 'ellipse', shape: undefined },
    { appliance: 'straight', shape: undefined },
    { appliance: 'arrow', shape: undefined },
    { appliance: 'shape', shape: 'pentagram' },
    { appliance: 'shape', shape: 'rhombus' },
    { appliance: 'shape', shape: 'speechBalloon' },
    { appliance: 'shape', shape: 'triangle' }
]