import { StyleSheet, PixelRatio, Platform } from "react-native";

export const styles = StyleSheet.create({
    whiteboard: {
        aspectRatio: 1.7777777777,
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
        shadowColor: '#000000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 4, height: 4 },
        margin: 6
    },
    controlBar: {
        borderWidth: Platform.OS == 'ios' ? 1 / PixelRatio.get() : 1,
        borderColor: '#cccccc',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        width: 44,
        backgroundColor: '#ffffff',
        justifyContent: 'center'
    },
    horizontalControlBar: {
        borderWidth: 1 / PixelRatio.get(),
        borderColor: '#ccc',
        borderTopRightRadius: 4,
        borderTopLeftRadius: 4,
        backgroundColor: 'white',
        flexDirection: 'row'
    }
})