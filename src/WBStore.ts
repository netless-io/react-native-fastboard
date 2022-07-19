import type { Room, SDK } from '@netless/react-native-whiteboard';
import create, { StoreApi, UseBoundStore } from 'zustand';
import { defaultColors, isShape } from './whiteboardConfig';
import type { Appliance, ApplianceShape } from '@netless/whiteboard-bridge-types';

function stringToNums(str: string): number[] {
  var sColor = str.toLowerCase();
  var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
          var sColorNew = "#";
          for (var i=1; i<4; i+=1) {
              sColorNew += sColor.slice(i, i+1).concat(sColor.slice(i, i+1));    
          }
          sColor = sColorNew;
      }
      var sColorChange = [];
      for (var i=1; i<7; i+=2) {
          sColorChange.push(parseInt("0x"+sColor.slice(i, i+2)));    
      }
      return sColorChange;
  }
  return [];
};

interface WBStore {
    appliance: Appliance
    setAppliance: (newAppliance: Appliance) => void
    color: string,
    setColor: (newColor: string) => void
    strokeWidth: number,
    setStrokeWidth: (width: number) => void
    showPencilPanel: boolean
    showShapePanel: boolean
    showDelete: boolean
    shape: ApplianceShape | undefined
    setShape: (shape: ApplianceShape | undefined) => void
    hideAllSubPanel: () => void
    clean: () => void
    delete: () => void
}


export type WBStoreInstance = UseBoundStore<StoreApi<WBStore>>;

export function createWBStore(props: {room: Room, sdk: SDK}) {
  const room = props.room;
  // const sdk = props.sdk;
  let shape: ApplianceShape | undefined
  const initAppliance = props.room.roomState.memberState.currentApplianceName;
  if (props.room.roomState.memberState.currentApplianceName == 'shape') {
    shape = props.room.roomState.memberState.shapeType ?? 'triangle';
  }  else {
    shape = undefined
  }
  const wbStore = create<WBStore>(set => ({
    appliance: initAppliance,
    setAppliance: (newAppliance) => {
      const isPencil = newAppliance == 'pencil';
      set({
        appliance: newAppliance,
        showPencilPanel: isPencil,
        showShapePanel: isShape(newAppliance),
        showDelete: newAppliance === 'selector',
        shape: undefined,
      })
      room.setMemberState({currentApplianceName: newAppliance})
    },
    color: defaultColors[0] as string,
    setColor: (newColor) => {
      const nums = stringToNums(newColor);
      room.setMemberState({strokeColor: nums, textColor: nums})
      set({ color: newColor })
    },
    strokeWidth: 0,
    setStrokeWidth: (width) => {
      room.setMemberState({strokeWidth: width})
      set({strokeWidth: width})
    },
    showPencilPanel: false,
    showShapePanel: false,
    showDelete: false,
    shape: shape,
    setShape: (shape) => {
      if (shape) {
        wbStore.getState().setAppliance('shape');
      }
      room.setMemberState({shapeType: shape})
      set({shape})
    },
    hideAllSubPanel: () => {
      console.log('hide all');
      set({ showDelete: false, showPencilPanel: false, showShapePanel: false })
    },
    clean: () => {
      room.cleanScene(true);
    },
    delete: () => {
      room.delete();
    }
  }));
  return wbStore;
}
