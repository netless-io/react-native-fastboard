import React from "react";
import { RoomConfig, SDK, WhiteboardView } from "@netless/react-native-whiteboard";
import { View, Dimensions, StyleProp, ViewStyle } from "react-native";
import { CompactPanel } from "./panel/compactPanel";
import { styles } from "../styles/styles";
import { RegularPanel } from "./panel/regularPanel";
import { createPanelStateStore, EventName } from "../store/panelStateStore";
import uuid from "react-native-uuid";
import type { Room, RoomCallbackHandler, SDKCallbackHandler, SDKConfig } from "@netless/react-native-whiteboard";

export type FastRoomStyle = {
    container?: StyleProp<ViewStyle>,
    fastRoom?: StyleProp<ViewStyle>
}

export type DocumentPage = {
    src: string
    width: number
    height: number
    previewURL?: string
}

export class FastRoomObject {
    readonly room: Room;
    readonly sdk: SDK
    constructor(aRoom: Room, aSDK: SDK) {
        this.room = aRoom;
        this.sdk = aSDK;
    }

    insertImage(url: string, size: { width: number, height: number }, locked?: boolean) {
        const id = uuid.v4() as string;
        this.room.insertImage({
            ...size, 
            centerX: this.room.roomState.cameraState.centerX, 
            centerY: this.room.roomState.cameraState.centerY,
            uuid: id,
            locked: locked || false
        });
        this.room.completeImageUpload(id, url);
    }

    insertMedia(src: string, title: string) {
        this.room.addApp('MediaPlayer', {title}, {src})
    }

    insertSlide(taskId: string, url: string, title: string) {
        const randomId = uuid.v4();
        const scenePath = `/${randomId}`;
        this.room.addApp('Slide', {title, scenePath}, {taskId, url});
    }

    insertStaticDocument(pages: DocumentPage[], title: string) {
        const randomId = uuid.v4();
        const scenePath = `/${randomId}`;
        const scenes = pages.map((page, index) => {
            return {name: `${index + 1}`, ppt: page};
        });
        this.room.addApp('DocsViewer', {title, scenePath, scenes}, {});
    }
}

let fastRoomObj: FastRoomObject | undefined;

const MemoWhiteboardView = React.memo(WhiteboardView);

const internalRoomCallbacks: Partial<RoomCallbackHandler> = {
    onRoomStateChanged: e => wbStore.getState().dispatch({ name: EventName.roomStateUpdated, payload: e }),
    onCanRedoStepsUpdate: e => wbStore.getState().dispatch({ name: EventName.redoEnableUpdate, payload: e > 0 }),
    onCanUndoStepsUpdate: e => wbStore.getState().dispatch({ name: EventName.undoEnableUpdate, payload: e > 0 }),
}

const internalSDKCallbacks: Partial<SDKCallbackHandler> = {
    onLogger: args => console.log('whiteboard log: ', args),
    onSetupFail: error => console.log('sdk setup fail: ', error)
}

const wbStore = createPanelStateStore({ appliance: 'rectangle', shape: undefined });

function functionMerge<T>(a: T, b: T): T {
    const map = {};
    const keys = Object.keys(a);
    Object.keys(b).forEach(key => {
        keys.indexOf(key) === -1 && keys.push(key);
    })
    keys.forEach(key => {
        map[key] = function(this, ...args) {
            a[key] && a[key].apply(this, args);
            b[key] && b[key].apply(this, args);
        }
    })
    return map as T;
}

export type FastRoomProps = {
    sdkParams: SDKConfig, 
    roomParams: RoomConfig, 
    joinRoomSuccessCallback?: (FastRoomObject) => void,  
    roomCallback?: Partial<RoomCallbackHandler>, 
    sdkCallback?: Partial<SDKCallbackHandler>, 
    style?: FastRoomStyle | undefined
}

export function FastRoom(props: FastRoomProps) {
    const didInitialize = wbStore(s => s.didInitialize);

    const memorizedShapeAppliancePair = wbStore(s => s.memorizedShapeAppliancePair);

    const currentShape = wbStore(s => s.applianceAndShape.shape);
    const currentAppliance = wbStore(s => s.applianceAndShape.appliance);
    const strokeWidth = wbStore(s => s.strokeWidth);
    const currentStrokeColor = wbStore(s => s.strokeColor);
    const currentTextColor = wbStore(s => s.textColor);

    const undoDisable = !wbStore(s => s.undoEnable)
    const redoDisable = !wbStore(s => s.redoEnable)
    const prePageDisable = !wbStore(s => s.prePageEnable);
    const nextPageDisable = !wbStore(s => s.nextPageEnable);

    const showCompactColorSubPanel = wbStore(s => s.showCompactColorSubPanel);
    const showCompactSubToolPanel = wbStore(s => s.showCompactSubToolPanel);
    const showCompactColorButton = wbStore(s => s.showCompactColorButton);

    const showTextAdjustPanel = wbStore(s => s.showTextAdjustPanel);
    const showDelete = wbStore(s => s.showDelete);
    const showPencilAdjustPanel = wbStore(s => s.showPencilAdjustPanel);

    const showShapePanel = wbStore(s => s.showShapePanel);

    const pageState = wbStore(s => s.pageState);
    const pageValue = `${pageState.index + 1} / ${pageState.length}`

    const joinRoomCallback = React.useCallback((aRoom?: Room, sdk?: SDK, error?: Error) => {
        if (error) {
            console.log(error);
        } else {
            fastRoomObj = new FastRoomObject(aRoom, sdk);
            props.joinRoomSuccessCallback && props.joinRoomSuccessCallback(fastRoomObj);
            wbStore.getState().initializeWithRoom(fastRoomObj.room);
        }
    }, []);

    const onStartShouldSetResponder = React.useCallback(()=> {
        wbStore.getState().dispatch({ name: EventName.whiteboardBeenTouched })
        return true
    }, []);

    const lessOne = Dimensions.get('window').width >= Dimensions.get('window').height ? Dimensions.get('window').height : Dimensions.get('window').width
    const isPad = lessOne >= 768;


    if (props.sdkParams.useMultiViews == undefined) {
        props.sdkParams.useMultiViews = true;
    }
    if (props.sdkParams.userCursor == undefined) {
        props.sdkParams.userCursor = true;
    }

    if (props.roomParams.disableNewPencil == undefined) {
        props.roomParams.disableNewPencil = false;
    }

    const roomCallbacks = React.useMemo(() => {
        return functionMerge(internalRoomCallbacks, props.roomCallback || {});
    }, [props.roomCallback, internalRoomCallbacks]);

    const sdkCallbacks = React.useMemo(() => {
        return functionMerge(internalSDKCallbacks, props.sdkCallback || {});
    }, [internalSDKCallbacks, props.sdkCallback]);

    return (
        <View style={props.style && props.style.container}>
            {/* 注意这里不能触发重渲染，否则会出现错误. Bridge 的生命周期会出错 */}
            <MemoWhiteboardView 
                style={props.style && props.style.fastRoom || styles.whiteboard}
                sdkConfig={props.sdkParams}
                roomConfig={props.roomParams}
                roomCallbacks={roomCallbacks}
                sdkCallbacks={sdkCallbacks}
                joinRoomCallback={joinRoomCallback}
                onStartShouldSetResponder={onStartShouldSetResponder}
            />

            {
                didInitialize && !isPad &&
                <CompactPanel
                    currentAppliance={currentAppliance}
                    currentShape={currentShape}
                    showCompactColorButton={showCompactColorButton}
                    showCompactColorSubPanel={showCompactColorSubPanel}
                    showCompactSubToolPanel={showCompactSubToolPanel}
                    showDelete={showDelete}
                    undoDisable={undoDisable}
                    redoDisable={redoDisable}
                    currentTextColor={currentTextColor}
                    currentStrokeColor={currentStrokeColor}
                    strokeWidth={strokeWidth}
                    room={fastRoomObj.room}
                    wbStore={wbStore} />
            }

            {didInitialize && isPad &&
                <RegularPanel
                    currentTextColor={currentTextColor}
                    showShapePanel={showShapePanel}
                    showDelete={showDelete}
                    showPencilAdjustPanel={showPencilAdjustPanel}
                    showTextAdjustPanel={showTextAdjustPanel}
                    undoDisable={undoDisable}
                    redoDisable={redoDisable}
                    prePageDisable={prePageDisable}
                    nextPageDisable={nextPageDisable}
                    pageValue={pageValue}
                    strokeWidth={strokeWidth}
                    currentStrokeColor={currentStrokeColor}
                    currentAppliance={currentAppliance}
                    currentShape={currentShape}
                    memorizedShapeAppliancePair={memorizedShapeAppliancePair}
                    room={fastRoomObj.room}
                    wbStore={wbStore}
                />
            }
        </View>
    );
}

