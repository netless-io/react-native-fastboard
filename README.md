# @netless/react-native-fastboard

Interactive whiteboard with user interface

## Installation

```sh
npm install --save @netless/react-native-fastboard @netless/react-native-whiteboard react-native-webview
```

## Usage

``` ts
import { FastRoom } from '@netless/react-native-fastboard';

<FastRoom  
    sdkParams={{
        appIdentifier: "whiteboard-appid",
        region: "us-sv", // "cn-hz" | "us-sv" | "sg" | "in-mum" | "gb-lon"
    }}
    roomParams={{
        uid: "unique_id_for_each_client",
        uuid: "room-uuid",
        roomToken: "NETLESSROOM_...",
    }}
/>
```

## Contributing

Suggest to submit pr or issue.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
