import type { Appliance, ApplianceShape } from "@netless/whiteboard-bridge-types";
import React from "react";
import { SafeAreaView, View } from "react-native";
import { CompactColorButton, ExecutionButton, ImageSelectableButton, StrokeSlider, ColorButton } from "../buttons";
import { imageSources } from "../../images";
import { AppliancePair, EventName, PanelStateStoreInstance } from "../../store/panelStateStore";
import { styles } from "../../styles/styles";
import { colorStringToRgbNums } from "../../utility";
import { defaultColors } from "../../whiteboardConfig";
import type { Room } from '@netless/react-native-whiteboard';

type CompactPanelProps = {
    currentAppliance: Appliance
    currentShape: ApplianceShape

    showCompactColorButton: boolean
    showCompactColorSubPanel: boolean
    showCompactSubToolPanel: boolean
    showDelete: boolean
    
    undoDisable: boolean
    redoDisable: boolean

    currentTextColor: string
    currentStrokeColor: string
    strokeWidth: number

    showApplianceTools: boolean
    showRedoUndo: boolean
    
    room: Room
    wbStore: PanelStateStoreInstance
}

const compactAppliance: AppliancePair[] = [
    { appliance: 'clicker', shape: undefined },
    { appliance: 'selector', shape: undefined },
    { appliance: 'pencil', shape: undefined },
    { appliance: 'eraser', shape: undefined },
    { appliance: 'straight', shape: undefined },
    { appliance: 'rectangle', shape: undefined },
    { appliance: 'ellipse', shape: undefined },
];

export function CompactPanel(props: CompactPanelProps) {
    const { currentAppliance, currentShape, room, showCompactColorButton, showCompactSubToolPanel, showCompactColorSubPanel, showDelete, undoDisable, redoDisable, currentStrokeColor, wbStore, strokeWidth, currentTextColor } = props;
    return (<SafeAreaView style={styles.compactPanel} pointerEvents={'box-none'}>
        <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
            {props.showApplianceTools && showCompactColorButton &&
                <View style={styles.controlBar}>
                    <CompactColorButton color={currentStrokeColor} onPress={() => wbStore.getState().dispatch({ name: EventName.clickCompactColors })} />
                </View>}
            {props.showApplianceTools && showDelete &&
                <View style={styles.controlBar}>
                    <ExecutionButton image={imageSources.delete} tintColor={"#ff0000"} onPress={room.delete} width={'100%'} />
                </View>}
            {!showDelete && !showCompactColorButton && <View style={{ width: 44, height: 44 }} />}
            {props.showApplianceTools && <View style={{ ...styles.controlBar, marginTop: 6 }}>
                <ImageSelectableButton
                    image={imageSources[currentShape ?? currentAppliance]}
                    selected={true}
                    onPress={() => wbStore.getState().dispatch({ name: EventName.clickCompactTools })}
                    width={"100%"}
                />
            </View>}

            { props.showRedoUndo && <View style={{ ...styles.controlBar, marginTop: 6 }}>
                <ExecutionButton image={imageSources.undo} disabled={undoDisable} onPress={room.undo} width={'100%'} />
                <ExecutionButton image={imageSources.redo} disabled={redoDisable} onPress={room.redo} width={'100%'} />
            </View>}
        </View>

        {
            showCompactColorSubPanel && !showDelete &&
            (<View style={{ ...styles.subPanel, alignSelf: 'center', translateY: -44 }}>
                <StrokeSlider width={strokeWidth} onSlidingComplete={width => {
                    if (currentAppliance == 'text') {
                        room.setMemberState({ textSize: width });
                        wbStore.getState().dispatch({ name: EventName.dragTextWidthSlideEnd, payload: width });
                    } else {
                        room.setMemberState({ strokeWidth: width });
                        wbStore.getState().dispatch({ name: EventName.dragStrokeWidthSlideEnd, payload: width });
                    }
                }} />
                {defaultColors.map(color => <ColorButton color={color}
                    key={color.toString()}
                    selected={currentAppliance == 'text' ? currentTextColor == color : currentStrokeColor == color}
                    onPress={() => {
                        if (currentAppliance == 'text') {
                            room.setMemberState({ textColor: colorStringToRgbNums(color) });
                            wbStore.getState().dispatch({ name: EventName.clickTextColor, payload: color })
                        } else {
                            room.setMemberState({ strokeColor: colorStringToRgbNums(color) });
                            wbStore.getState().dispatch({ name: EventName.clickStrokeColor, payload: color })
                        }
                    }} />
                )}
            </View>)
        }

        {showCompactSubToolPanel &&
            (<View style={{ ...styles.subPanel, alignSelf: 'center' }}>
                {compactAppliance.map(value => {
                    return <ImageSelectableButton
                        image={imageSources[value.shape ?? value.appliance]}
                        selected={currentAppliance == value.appliance && currentShape == value.shape}
                        onPress={() => {
                            room.setMemberState({ currentApplianceName: value.appliance, shapeType: value.shape });
                            wbStore.getState().dispatch({ name: EventName.clickAppliancePairOnSubPanel, payload: { appliance: value.appliance, shape: value.shape } })
                        }}
                        width={"25%"}
                        key={value.appliance + (value.shape ?? '')}
                    />
                })}
                <ExecutionButton image={imageSources.clean} disabled={false} onPress={() => room.cleanScene(true)} width={'25%'} />
            </View>)
        }
    </SafeAreaView>)
}