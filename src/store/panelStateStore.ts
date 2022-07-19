import type { Room } from '@netless/react-native-whiteboard';
import type { Appliance, ApplianceShape } from '@netless/whiteboard-bridge-types';
import create, { StoreApi, UseBoundStore } from 'zustand';
import { rgbArrayToHex } from '../utility';
import type { PageState } from '@netless/window-manager';

export type AppliancePair = {appliance: Appliance, shape: ApplianceShape | undefined};
export type PanelStateStoreInstance = UseBoundStore<StoreApi<PanelStateStore>>;

export enum EventName {
  clickAppliancePairOnMainBar,
  clickAppliancePairOnSubPanel,
  clickShapes,
  dragStrokeWidthSlideEnd,
  dragTextWidthSlideEnd,
  clickStrokeColor,
  clickTextColor,
  whiteboardBeenTouched,
  roomStateUpdated,
  undoEnableUpdate,
  redoEnableUpdate,

  // For Compact Only
  clickCompactTools,
  clickCompactColors,
}

export type Event = {
  name: EventName,
  payload?: any
}

export interface PanelStateStore {
  didInitialize: boolean
  initializeWithRoom:(room: Room) => void

  // For regular only
  memorizedShapeAppliancePair: AppliancePair

  applianceAndShape: AppliancePair
  textColor: string
  strokeColor: string
  strokeWidth: number
  textWidth: number
  pageState: {index: number, length: number}
  ignorePageUpdateTime: number

  prePageEnable: boolean
  nextPageEnable: boolean
  undoEnable: boolean
  redoEnable: boolean

  showTextAdjustPanel: boolean
  showPencilAdjustPanel: boolean
  showShapePanel: boolean
  showDelete: boolean

  showCompactColorSubPanel: boolean,
  showCompactSubToolPanel: boolean
  showCompactColorButton: boolean

  dispatch: (event: Event) => void
}

export function createPanelStateStore(defaultShapeAppliancePair: AppliancePair): PanelStateStoreInstance {
  return create<PanelStateStore>((set, get) => ({
    didInitialize: false,

    applianceAndShape: {appliance: 'pencil', shape: undefined},
    textColor: '',
    strokeColor: '',
    strokeWidth: 0,
    textWidth: 0,
    pageState: {index: 0, length: 0},

    prePageEnable: false,
    nextPageEnable: false,

    undoEnable: false,
    redoEnable: false,

    showTextAdjustPanel: false,
    showPencilAdjustPanel: false,
    showShapePanel: false,
    showDelete: false,

    showCompactColorSubPanel: false,
    showCompactSubToolPanel: false,
    showCompactColorButton: false,

    memorizedShapeAppliancePair: defaultShapeAppliancePair,
    
    initializeWithRoom: (room: Room) => {
      const initMemberState = room.roomState.memberState;

      let initApplianceAndShape: AppliancePair

      // workaround for whiteboard can't get the shapeType at init time.
      if (initMemberState.currentApplianceName == 'shape' && initMemberState.shapeType == undefined) {
        room.setMemberState({currentApplianceName: defaultShapeAppliancePair.appliance, shapeType: defaultShapeAppliancePair.shape})
        initApplianceAndShape = {
          appliance: defaultShapeAppliancePair.appliance,
          shape: defaultShapeAppliancePair.shape
        }
      } else {
        initApplianceAndShape = {
          appliance: initMemberState.currentApplianceName,
          shape: initMemberState.shapeType
        };
      }

      set({
        didInitialize: true,
        applianceAndShape: initApplianceAndShape,
        textColor: initMemberState.textColor ? rgbArrayToHex(initMemberState.textColor) : rgbArrayToHex(initMemberState.strokeColor),
        textWidth: initMemberState.strokeWidth,
        strokeColor: initMemberState.strokeColor ? rgbArrayToHex(initMemberState.strokeColor) : '',
        strokeWidth: initMemberState.strokeWidth,
        pageState: room.roomState.pageState,

        prePageEnable: prePageEnable(room.roomState.pageState),
        nextPageEnable: nextPageEnable(room.roomState.pageState),

        showDelete: initMemberState.currentApplianceName === 'selector',
        showCompactColorButton: hasColorAttribute(initMemberState.currentApplianceName),
      })
    },
    dispatch: (event: Event) => {
      switch (event.name) {
        case EventName.clickAppliancePairOnMainBar:
          const appliancePair = event.payload as AppliancePair;
          const appliance = appliancePair.appliance;

          const isPencil = appliance == 'pencil';
          const isOldPencil = get().applianceAndShape.appliance == 'pencil';
          const isText = appliance == 'text';
          const isOldText = get().applianceAndShape.appliance == 'text';
          set({
            applianceAndShape: {appliance: appliance, shape: undefined},
            showPencilAdjustPanel: isPencil ? (isOldPencil ? !get().showPencilAdjustPanel: true) : false, 
            showDelete: appliance == 'selector',
            showTextAdjustPanel:  isText ? (isOldText ? !get().showTextAdjustPanel : true): false,
            showShapePanel: false
          });
          return;
        case EventName.clickAppliancePairOnSubPanel:
          set({
            applianceAndShape: event.payload as AppliancePair,
            memorizedShapeAppliancePair: event.payload as AppliancePair,
            showDelete: (event.payload as AppliancePair).appliance == 'selector',
            showCompactColorButton: hasColorAttribute((event.payload as AppliancePair).appliance),
          });
          return;
        case EventName.clickShapes:
          set({
            showShapePanel: !get().showShapePanel,
            showTextAdjustPanel: false,
            showPencilAdjustPanel: false,
            applianceAndShape: get().memorizedShapeAppliancePair
          })
          return;
        case EventName.dragStrokeWidthSlideEnd:
          set({
            strokeWidth: event.payload as number
          })
          return;
        case EventName.dragTextWidthSlideEnd:
          set({
            textWidth: event.payload as number
          })
          return;
        case EventName.clickStrokeColor:
          set({
            strokeColor: event.payload as string
          })
          return;
        case EventName.clickTextColor:
          set({
            textColor: event.payload as string
          })
          return;
        case EventName.whiteboardBeenTouched:
          set({
            showTextAdjustPanel: false,
            showPencilAdjustPanel: false,
            showShapePanel: false,
            showCompactColorSubPanel: false,
            showCompactSubToolPanel: false,
          })
          return;
        case EventName.clickCompactTools:
          set({showCompactSubToolPanel: !get().showCompactSubToolPanel, showCompactColorSubPanel: false})
          return;
        case EventName.clickCompactColors:
          set({showCompactColorSubPanel: !get().showCompactColorSubPanel, showCompactSubToolPanel: false});
          return;
        case EventName.undoEnableUpdate:
          set({undoEnable: event.payload as boolean});
          return;
        case EventName.redoEnableUpdate:
          set({redoEnable: event.payload as boolean});
          return;
        case EventName.roomStateUpdated:
          if (event.payload.pageState) {
            set({
              pageState: event.payload.pageState,
              prePageEnable: prePageEnable(event.payload.pageState),
              nextPageEnable: nextPageEnable(event.payload.pageState)
            });
          }
          return;
      }
    }
  } as any))
}

function prePageEnable(state: PageState): boolean {
  return state.index > 0;
}

function nextPageEnable(state: PageState): boolean {
  return state.index < state.length - 1
}

function hasStrokeColorAttribute(appliance: Appliance): boolean {
  const strokeColorAppliances: Appliance[] = [
    'text',
    'pencil',
    'rectangle',
    'ellipse',
    'shape',
    'straight',
    'arrow',
  ]
  const r = strokeColorAppliances.find(e=>e==appliance);
  return r == undefined ? false : true;
}

function hasTextColorAttribute(appliance: Appliance): boolean {
  return appliance == 'text';
}

function hasColorAttribute(appliance: Appliance): boolean {
  return hasStrokeColorAttribute(appliance) || hasTextColorAttribute(appliance);
}