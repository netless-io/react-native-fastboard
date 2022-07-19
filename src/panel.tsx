import { Slider } from '@miblanchard/react-native-slider';
import type { Appliance, ApplianceShape } from '@netless/whiteboard-bridge-types';
import React, { useState } from 'react';
import { imageSources } from './images';
import type { WBStoreInstance } from './WBStore';
import { branColor, defaultColors, isShape } from './whiteboardConfig';
import {
  StyleSheet,
  Image,
  View,
  ImageSourcePropType,
  PixelRatio,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';

let wbStore: WBStoreInstance

function ColorButton(props: { color: string }) {
return <TouchableOpacity
      onPress={()=>wbStore.getState().setColor(props.color)}
      style={{ 
        borderWidth: 1, 
        borderColor: (wbStore(s => s.color) === props.color) ? props.color : '#00000000', 
        borderRadius: 4, 
        aspectRatio: 1, 
        width: '25%', 
        padding: 2,
      }}>
      <View style={{ backgroundColor: props.color, width: '100%', height: '100%', borderRadius: 4}} />
    </TouchableOpacity>
}

function ExecutionButton(props: { image: ImageSourcePropType, tintColor: string, onClick: ()=>void}) {
  const [press, setPress] = useState(false);

  const color: string = press ? (props.tintColor + '50') : props.tintColor;
  return (<TouchableOpacity
    style={[styles.buttonContainer, {width: '100%'}]}
    onPressIn={()=>setPress(true)}
    onPressOut={()=>setPress(false)}
    onPress={props.onClick}
    key={props.image.toString()}
  >
    <Image
      source={props.image}
      style={{alignSelf: 'center', tintColor: color}}
    />
  </TouchableOpacity>)
}

function ImageSelectableButton(props: { image: ImageSourcePropType, selected: boolean, onClick: () => void, width: '25%' | '100%'}) {
  const textColor = props.selected ? branColor : '#5D5D5D';
  return (<TouchableOpacity
        style={[styles.buttonContainer, {width: props.width}]}
        onPress={props.onClick}
        key={props.image.toString()}
      >
        <Image
          source={props.image}
          style={{tintColor: textColor, alignSelf: 'center'}}
        />
      </TouchableOpacity>)
}

function StrokeSlider(props:{width: number}) {
  return <Slider
  minimumValue={1}
  maximumValue={20}
  value={props.width}
  containerStyle={{ width: '100%' }}
  thumbStyle={{ backgroundColor: 'white', shadowColor: 'black', shadowOpacity: 0.2, shadowOffset: { width: 4, height: 4 } }}
  minimumTrackTintColor={branColor.toString()}
  onSlidingComplete={r => {
    if (typeof r == 'number') {
      wbStore.getState().setStrokeWidth(r);
    } else {
      if (r.length > 0) {
        wbStore.getState().setStrokeWidth(r[0]);
      }
    }
  }}
  />
}

function SubPanelSelectableApplianceButton(props: {
  selected: boolean,
  appliance: Appliance,
  shape?: ApplianceShape
}) {
  const key = props.shape ? props.shape : props.appliance;
  return ImageSelectableButton({
    image: imageSources[key],
    selected: props.selected,
    onClick: () => {
      if (props.shape) {
        wbStore.getState().setShape(props.shape);
      } else {
        wbStore.getState().setAppliance(props.appliance);
      }
    },
    width: '25%',
  })
}

function SingleSelectableApplianceButton(props: {appliance: Appliance, shape?: ApplianceShape }) {
  const appliance = wbStore(s => s.appliance);
  const shape = wbStore(s => s.shape);
  let selected: boolean
  if (props.shape) {
    selected = shape == props.shape
  } else {
    selected = appliance == props.appliance;
  }
  const key = props.shape ? props.shape : props.appliance;
  return ImageSelectableButton({
    image: imageSources[key],
    selected: selected,
    onClick: () => {
      if (props.shape) {
        wbStore.getState().setShape(props.shape);
      } else {
        wbStore.getState().setAppliance(props.appliance);
      }
    },
    width: '100%'
  })
}

function PencilButton() {
  const pencilStr = 'pencil';
  const selected = wbStore(s => s.appliance) == pencilStr;
  return <View style={{ width: '100%' }}>
    {ImageSelectableButton({
      image: imageSources[pencilStr],
      selected: selected,
      onClick: () => {
        wbStore.getState().setAppliance(pencilStr);
      },
      width: '100%'
    })}
  </View>
}

function ShapesButton() {
  const current = wbStore(s => s.appliance);
  const currenShape = wbStore(s => s.shape);
  let display: {appliance: Appliance, shape?: ApplianceShape}
  if (isShape(current)) {
    display = {appliance: current, shape: currenShape}
  } else {
    display = {appliance: 'rectangle'}
  }
  return <View style={{ width: '100%' }}>
    <SingleSelectableApplianceButton appliance={display.appliance} shape={display.shape} />
  </View>
}

export function Panel(props: {style: StyleProp<ViewStyle>, store: WBStoreInstance}) {
    wbStore = props.store;

    const shapes: {
      appliance: Appliance,
      shape?: ApplianceShape
    }[] = [
      {appliance: 'rectangle'},
      {appliance: 'ellipse'},
      {appliance: 'straight'},
      {appliance: 'arrow'},
      {appliance: 'shape', shape: 'pentagram'},
      {appliance: 'shape', shape: 'rhombus'},
      {appliance: 'shape', shape: 'speechBalloon'},
      {appliance: 'shape', shape: 'triangle'}
    ]

    const currentShape = wbStore(s => s.shape);
    const currentAppliance = wbStore(s => s.appliance);
    const showPencil = wbStore(s => s.showPencilPanel);
    const storkeWidth = wbStore(s => s.strokeWidth);
    const showShapePanel = wbStore(s => s.showShapePanel);
    const strokeWidth = wbStore(s => s.strokeWidth);
      return (
        <View style={props.style}>
          <View>
            {wbStore(s => s.showDelete) &&
              (<View style={{...styles.controlBar, marginBottom: 6}}>
                <ExecutionButton tintColor={'#ff0000'} image={imageSources.delete} onClick={() => wbStore.getState().delete()}></ExecutionButton>
              </View>)
            }
            <View style={styles.controlBar}>
              <SingleSelectableApplianceButton appliance={'clicker'} />
              <SingleSelectableApplianceButton appliance={'selector'} />
              <PencilButton />
              <SingleSelectableApplianceButton appliance={'text'} />
              <SingleSelectableApplianceButton appliance={'eraser'} />
              <ShapesButton />
              <ExecutionButton tintColor={'#5D5D5D'} image={imageSources.clean} onClick={() => wbStore.getState().clean()} />
            </View>
          </View>

          {showPencil &&
            (<View style={styles.subPanel} >
              <StrokeSlider width={storkeWidth} />
              {defaultColors.map(c => <ColorButton color={c} key={c.toString()} />)}
            </View>)
          }

          {showShapePanel &&
            (<View
              style={styles.subPanel}
            >
              {shapes.map(p => {
                if (p.shape) {
                  return SubPanelSelectableApplianceButton({...p, selected: p.shape == currentShape});
                } else {
                  return SubPanelSelectableApplianceButton({...p, selected: p.appliance == currentAppliance});
                }
              }
              )}
              <StrokeSlider width={strokeWidth} />
              {defaultColors.map(c => <ColorButton color={c} key={c.toString()} />)}
            </View>)
          }
        </View>
      );
}

const styles = StyleSheet.create({
    addOnControlBar: {
      alignItems: 'center',
      backgroundColor: '#000',
      borderWidth: 1 / PixelRatio.get(),
      borderColor: '#ccc',
      borderRadius: 4,
    },
    controlBar: {
      alignItems: 'center',
      borderWidth: 1 / PixelRatio.get(),
      borderColor: '#ccc',
      borderRadius: 4,
      backgroundColor: 'white',
      width: 44,
    },
    buttonContainer: {
      height: 44,
      justifyContent: 'center',
    },
    subPanel: {
      borderWidth: 1 / PixelRatio.get(),
      borderColor: '#ccc',
      borderRadius: 4,
      backgroundColor: '#eee', width: 144,
      padding: 6,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      shadowColor: 'black',
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 4, height: 4 },
      margin: 6
    },
  });