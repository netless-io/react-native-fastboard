import type { Appliance, ApplianceShape } from "@netless/whiteboard-bridge-types";
import React from "react";
import { SafeAreaView, View, Text } from "react-native";
import type { Room } from "@netless/react-native-whiteboard";
import { ExecutionButton, ImageSelectableButton, StrokeSlider, ColorButton } from "../buttons";
import { imageSources } from "../../images";
import { AppliancePair, EventName, PanelStateStoreInstance } from "../../store/panelStateStore";
import { styles } from "../../styles/styles";
import { colorStringToRgbNums } from "../../utility";
import { defaultColors, shapes } from "../../whiteboardConfig";

const mainBar: AppliancePair[] = [
    { appliance: 'clicker', shape: undefined },
    { appliance: 'selector', shape: undefined },
    { appliance: 'pencil', shape: undefined },
    { appliance: 'text', shape: undefined },
    { appliance: 'eraser', shape: undefined },
];

type RegularPanelProps = {
    showDelete: boolean
    showPencilAdjustPanel: boolean
    showTextAdjustPanel: boolean
    showShapePanel: boolean

    undoDisable: boolean
    redoDisable: boolean
    prePageDisable: boolean
    nextPageDisable: boolean

    pageValue: string

    strokeWidth: number
    currentStrokeColor: string
    currentAppliance: Appliance
    currentShape: ApplianceShape
    currentTextColor: string

    memorizedShapeAppliancePair: AppliancePair

    room: Room
    wbStore: PanelStateStoreInstance
}

export function RegularPanel(props: RegularPanelProps) {
    const { currentTextColor, showShapePanel, showDelete, showPencilAdjustPanel, showTextAdjustPanel, undoDisable, redoDisable, prePageDisable, nextPageDisable, pageValue, strokeWidth, currentStrokeColor, currentAppliance, currentShape, memorizedShapeAppliancePair, room, wbStore } = props;
    return (<SafeAreaView style={{position: 'absolute', width: '100%', height: '100%', flexDirection: 'row', alignItems: 'flex-end'}} pointerEvents={'box-none'}>
        <View style={{ alignSelf: 'center' }}>
            {showDelete &&
                <View style={{ ...styles.controlBar, position: 'absolute', left: 0, top: -54 }}>
                    <ExecutionButton image={imageSources.delete} tintColor={"#ff0000"} onPress={room.delete} />
                </View>}

            <View style={{ ...styles.controlBar, alignSelf: 'center' }}>
                {
                    mainBar.map(value => {
                        return <ImageSelectableButton
                            image={imageSources[value.shape ?? value.appliance]}
                            selected={currentAppliance == value.appliance && currentShape == value.shape}
                            onPress={() => {
                                room.setMemberState({ currentApplianceName: value.appliance, shapeType: value.shape });
                                wbStore.getState().dispatch({ name: EventName.clickAppliancePairOnMainBar, payload: { appliance: value.appliance, shape: value.shape } })
                            }}
                            width={"100%"}
                            key={value.appliance + (value.shape ?? '')}
                        />
                    })
                }
                <ImageSelectableButton
                    image={imageSources[memorizedShapeAppliancePair.shape ? memorizedShapeAppliancePair.shape : memorizedShapeAppliancePair.appliance]}
                    selected={currentAppliance == memorizedShapeAppliancePair.appliance && currentShape == memorizedShapeAppliancePair.shape}
                    onPress={() => {
                        room.setMemberState({ currentApplianceName: memorizedShapeAppliancePair.appliance, shapeType: memorizedShapeAppliancePair.shape });
                        wbStore.getState().dispatch({ name: EventName.clickShapes });
                    }}
                    width={"100%"}
                    key={memorizedShapeAppliancePair.appliance + (memorizedShapeAppliancePair.shape ?? '')}
                />
                <ExecutionButton tintColor={'#5D5D5D'} image={imageSources.clean} onPress={() => room.cleanScene(true)} />
            </View>
        </View>

        <View style={{ ...styles.horizontalControlBar, left: 16, position: 'absolute'}}>
            <ExecutionButton image={imageSources.undo} disabled={undoDisable} onPress={room.undo} />
            <ExecutionButton image={imageSources.redo} disabled={redoDisable} onPress={room.redo} />
        </View>

        <View style={{ left: 0, right: 0, position: 'absolute', justifyContent: 'center', alignItems: 'center' }} pointerEvents={'box-none'}>
            <View style={styles.horizontalControlBar}>
                <ExecutionButton image={imageSources.prev} disabled={prePageDisable} onPress={() => room.prevPage()} />
                <Text style={{ alignSelf: 'center' }}>{pageValue}</Text>
                <ExecutionButton image={imageSources.next} disabled={nextPageDisable} onPress={() => room.nextPage()} />
                <ExecutionButton image={imageSources.whiteboardAdd} onPress={() => room.addPage({}).then(()=>room.nextPage())} />
            </View>
        </View>

        {showPencilAdjustPanel &&
            <View style={{...styles.subPanel, alignSelf: 'center'}}>
                <StrokeSlider width={strokeWidth} onSlidingComplete={width => {
                    room.setMemberState({ strokeWidth: width })
                    wbStore.getState().dispatch({ name: EventName.dragStrokeWidthSlideEnd, payload: width })
                }} />
                {defaultColors.map(c => <ColorButton color={c} key={c.toString()} selected={currentStrokeColor == c}
                    onPress={() => {
                        room.setMemberState({ strokeColor: colorStringToRgbNums(c) })
                        wbStore.getState().dispatch({ name: EventName.clickStrokeColor, payload: c })
                    }} />)}
            </View>
        }

        {showShapePanel &&
            (<View style={{ ...styles.subPanel, alignSelf: 'center'}} >

                {shapes.map(value => {
                    return <ImageSelectableButton
                        image={imageSources[value.shape ?? value.appliance]}
                        selected={currentAppliance == value.appliance && currentShape == value.shape}
                        onPress={() => {
                            room.setMemberState({ currentApplianceName: value.appliance, shapeType: value.shape });
                            wbStore.getState().dispatch({name: EventName.clickAppliancePairOnSubPanel, payload: value})
                        }}
                        width={"25%"}
                        key={value.appliance + (value.shape ?? '')}
                    />
                })}

                <StrokeSlider width={strokeWidth} onSlidingComplete={width => {
                    room.setMemberState({ strokeWidth: width });
                    wbStore.getState().dispatch({name: EventName.dragStrokeWidthSlideEnd, payload: width});
                }} />
                {defaultColors.map(c => <ColorButton color={c} key={c.toString()} selected={currentStrokeColor == c} onPress={() => {
                    room.setMemberState({ strokeColor: colorStringToRgbNums(c) });
                    wbStore.getState().dispatch({name: EventName.clickStrokeColor, payload: c});
                }} />)}
            </View>)
        }

        {showTextAdjustPanel &&
            (<View style={{ ...styles.subPanel, alignSelf: 'center' }} >
                {defaultColors.map(c => <ColorButton color={c} key={c.toString()} selected={currentTextColor == c} onPress={() => {
                    room.setMemberState({ textColor: colorStringToRgbNums(c) });
                    wbStore.getState().dispatch({ name: EventName.clickTextColor, payload: c });
                }} />)}
            </View>)
        }
    </SafeAreaView>);
}
