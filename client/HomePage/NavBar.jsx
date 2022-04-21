import React, { Component } from "react";
import path from 'path';

import Playground from './Playground';
import "./NavBar.css";

export default class NavBar extends Component {
    constructor() {
        super();
        this.playground = new Playground();
        this.pluginNamePathMap = this.createMapOfPluginAndFilePath();
    }

    createMapOfPluginAndFilePath() {
        const pluginPath = path.join(this.playground.currentDir, "samples");
        return {
            "petals" : path.join(pluginPath, "Petals"),
            "managedUI": path.join(pluginPath, "ManagedUIDemo"),
            "createShapes": path.join(pluginPath, "CreateShapes"),
            "pollWidget": path.join(pluginPath, "PollWidget"),
            "chatRoom": path.join(pluginPath, "ChatRoom"),
            "ticTacToe": path.join(pluginPath, "TicTacToe")
        }
    }

    setPluginCodeInEditor(key) {
        if (!this.pluginNamePathMap.hasOwnProperty(key)) {
            return;
        }
        this.playground.setPluginCodeInEditor(this.pluginNamePathMap[key]);
    }

    render() {
        return ( 
            <div className="menuContainer">
                <div id="examples">Examples</div>
                <ul>
                    Widgets
                    <li>
                        <button onClick={this.setPluginCodeInEditor.bind(this, "pollWidget")}>Poll Widget</button>
                    </li>
                    <li>
                        <button onClick={this.setPluginCodeInEditor.bind(this, "chatRoom")}>Chat Room</button>
                    </li>
                    <li>
                        <button onClick={this.setPluginCodeInEditor.bind(this, "ticTacToe")}>TicTacToe</button>
                    </li>
                </ul>
                <ul>
                    Plugins
                    <li>
                        <button onClick={this.setPluginCodeInEditor.bind(this, "petals")}>Petals</button>
                    </li>
                    <li>
                        <button onClick={this.setPluginCodeInEditor.bind(this, "managedUI")}>Managed UI</button>
                    </li>
                    <li>
                        <button onClick={this.setPluginCodeInEditor.bind(this, "createShapes")}>Shapes Creator</button>
                    </li>
                </ul>
            </div>
        );
    }
}
