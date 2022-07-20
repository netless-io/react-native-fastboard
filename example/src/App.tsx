import * as React from 'react';
import { Button, Dimensions, StyleSheet, View } from 'react-native';
import { appIdentifier, roomToken, uid, userPayload, uuid } from './roomConst';
import { DocumentPage, FastRoom, FastRoomObject, RoomCallbackHandler, RoomConfig, SDKConfig } from '@netless/react-native-fastboard';

let fastRoomObj: FastRoomObject | undefined;
const sdkParams: SDKConfig = { appIdentifier, region: 'cn-hz', log: true };
const roomParams: RoomConfig = { uuid, uid, roomToken, userPayload };
const roomCallback: Partial<RoomCallbackHandler> = {
  onPhaseChanged: e => console.log('phase changed log, ', e)
}

const screen = Dimensions.get('screen');
const width = screen.width < screen.height ? screen.width : screen.height;
const height = screen.width < screen.height ? screen.height : screen.width;
const r = height / width;
const isPad = r <= 1.6;

const exampleImage = 'https://flat-storage.oss-accelerate.aliyuncs.com/cloud-storage/2022-03/17/36ab98ac-b0ed-47b5-87d8-87ff7f9b0ea1/36ab98ac-b0ed-47b5-87d8-87ff7f9b0ea1.jpeg';
const exampleMp4 = 'https://flat-storage.oss-accelerate.aliyuncs.com/cloud-storage/2022-03/17/4068b5d7-2d86-4e04-97b8-6003b0bf76c4/4068b5d7-2d86-4e04-97b8-6003b0bf76c4.mp4';
const exampleMp3 = 'https://flat-storage.oss-accelerate.aliyuncs.com/cloud-storage/2022-03/17/c9ef9acf-f39c-4329-b75a-f64124988f81/c9ef9acf-f39c-4329-b75a-f64124988f81.mp3';
const exampleDocPage: DocumentPage = {
  src: 'https://convertcdn.netless.link/staticConvert/a4dd2cf0070611edbc3cdfd599097076/1.png',
  width: 1320,
  height: 1020,
  previewURL: 'https://convertcdn.netless.link/staticConvert/a4dd2cf0070611edbc3cdfd599097076/1.png'
};
const examplePdfPage: DocumentPage = {
  src: 'https://convertcdn.netless.link/staticConvert/d5d026a0070611edab8425ff245dd924/1.png',
  width: 1468,
  height: 1900,
  previewURL: 'https://convertcdn.netless.link/staticConvert/d5d026a0070611edab8425ff245dd924/1.png'
}
const examplePptPage: DocumentPage = {
  src: 'https://convertcdn.netless.link/staticConvert/cbff94c0070c11edbb9193d17449bbb5/1.png',
  width: 1440,
  height: 810,
  previewURL: 'https://convertcdn.netless.link/staticConvert/cbff94c0070c11edbb9193d17449bbb5/1.png'
}

export default function App() {
  const [usingCustomDesign, setUsingCustomDesign] = React.useState(false);

  return (
    <View style={styles.container}>
      <FastRoom
        sdkParams={sdkParams}
        roomParams={roomParams}
        style={
          usingCustomDesign ?
            {
              container: styles.fastRoomContainer,
              controlBar: customStyles.controlBar,
              horizontalControlBar: customStyles.horizontalControlBar,
              subPanel: customStyles.subPanel,
              compactPanel: customStyles.compactPanel,
              applianceSelectedColor: '#ff3838',
              regularPanel: customStyles.regularPanel,
            } :
            {
              container: styles.fastRoomContainer,
            }
        }
        displayConfig={usingCustomDesign ? {
          showApplianceTools: true,
          showRedoUndo: true,
          showPageIndicator: false
        } : undefined}
        joinRoomSuccessCallback={(obj) => fastRoomObj = obj}
        roomCallback={roomCallback}
      />

      <View style={styles.operationContainer}>
        <Button title='Add image' onPress={() => fastRoomObj.insertImage(exampleImage, { width: 144, height: 144 })} />
        <Button title='Add Video' onPress={() => fastRoomObj.insertMedia(exampleMp4, 'example video')} />
        <Button title='Add Music' onPress={() => fastRoomObj.insertMedia(exampleMp3, 'example music')} />
        <Button title='Add word' onPress={() => fastRoomObj.insertStaticDocument([exampleDocPage], 'Hello docs')} />
        <Button title='Add pdf' onPress={() => fastRoomObj.insertStaticDocument([examplePdfPage], 'Hello pdf')} />
        <Button title='Add dynamic ppt' onPress={() => fastRoomObj.insertSlide('017909fcab64419bae1b3099b6f1dd7c', 'https://convertcdn.netless.link/dynamicConvert', '开始使用 Flat.pptx')} />
        <Button title='Add static ppt' onPress={() => fastRoomObj.insertStaticDocument([examplePptPage], 'Hello ppt')} />
        <Button title='Custom Design' onPress={() => setUsingCustomDesign(!usingCustomDesign)} />
      </View>
    </View>
  );
}

const customStyles = StyleSheet.create({
  controlBar: {
    backgroundColor: '#ffb8b8',
    width: 66
  },
  horizontalControlBar: {
    backgroundColor: '#ffb8b8'
  },
  subPanel: {
    backgroundColor: '#fffa65'
  },
  regularPanel: {
    flexDirection: 'row-reverse'
  },
  compactPanel: {
    flexDirection: 'row-reverse'
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: isPad ? 'column' : 'row',
    alignItems: isPad ? 'center' : 'flex-start',
    backgroundColor: 'yellow'
  },
  fastRoomContainer: {
    marginTop: 44,
    width: isPad ? '98%' : '60%',
    aspectRatio: 1.777777777
  },
  operationContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    flexWrap: 'wrap',
  }
});

