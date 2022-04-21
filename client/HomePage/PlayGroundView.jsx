import React from 'react';
import { Provider, defaultTheme } from "@adobe/react-spectrum";
import Editor from "./Editor"

export default class PlayGroundView extends React.Component {
  render() {
    const colorScheme = 'light';
    return (
      <Provider theme={defaultTheme} colorScheme={colorScheme}>
        <Editor />
      </Provider>
    );
  }
}
