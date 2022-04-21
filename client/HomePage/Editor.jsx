import React from 'react';
import ReactDOM from 'react-dom';
import Run from '@spectrum-icons/workflow/Play';
import ShowMenu from '@spectrum-icons/workflow/ShowMenu';
import Reset from '@spectrum-icons/workflow/Refresh';
import Export from '@spectrum-icons/workflow/Export';
import {
  Item,
  TabList,
  Tabs,
  Flex,
  View,
  Text,
  ActionButton,
  TooltipTrigger,
  Tooltip,
  Menu,
  MenuTrigger,
  DialogContainer
} from '@adobe/react-spectrum';
import { useProvider } from '@react-spectrum/provider';
import EditorView from './EditorView';
import './Editor.css';
import NavBar from './NavBar';

export const withProviderHook = ClassComponent => {
  return function ClassComponentWithHook(props) {
    const { colorScheme } = useProvider();
    return <ClassComponent theme={colorScheme} {...props} />;
  };
};

withProviderHook(Editor);

let currentCount = 0;

export default class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.containerId = `PlayGround${++currentCount}`;
    this.editorId = `${this.containerId}-editor`;
    this.editor = new EditorView();
    this.state = { dialog: "" , isMenuBarOpen: false };
  }

  componentDidMount() {
    setTimeout(() => {
      const resizeObserver = this.editor.mount(
        document.getElementById(this.editorId),
        { theme: this.props.theme }
      );
      resizeObserver.observe(document.getElementById(this.containerId));
      this.resizeObserver = resizeObserver;
    }, 200);
  }

  componentDidUpdate() {
    this.editor.update({ theme: this.props.theme });
  }

  componentWillUnmount() {
    this.editor.unmount();
    this.resizeObserver.disconnect();
  }

  handleTabChange(key) {
    this.editor.setTab(key);
  }

  handlePluginDownload() {
    this.updateDialogState("");
    this.editor.downloadPlugin();
  }

  handleReset() {
    this.editor.reset();
  }

  handlePlay() {
    this.editor.sendPluginToParent();
  }

  handleClipboardCopy() {
    this.updateDialogState("");
    this.editor.copyToClipboard();
  }

  handleMenu() {
    this.setState({ isMenuBarOpen: !this.state.isMenuBarOpen});
    ReactDOM.render( this.state.isMenuBarOpen === true ? <NavBar /> : null, document.getElementById("navBar"));
  }

  updateDialogState(key) {
    this.setState({ dialog: key });
  }

  render() {
    return (
      <Flex
        marginX="size-100"
        direction="column"
        height="100%"
        id={this.containerId}
      >
        <Flex marginTop="size-125" marginX="size-100" direction="column">
          <Tabs
            defaultSelectedKey={this.editor.selectedTabId}
            onSelectionChange={this.handleTabChange.bind(this)}
            isQuiet
          >
            <Flex
              direction="row"
              marginTop="size-100"
              alignItems="center"
              justifyContent="space-between"
            >
              <TooltipTrigger delay={0}>
                <ActionButton variant="secondary"isQuiet onPress={this.handleMenu.bind(this)}>
                  <ShowMenu />
                </ActionButton>
                <Tooltip>{this.state.isMenuBarOpen ? "Hide Menu" : "Show Menu"}</Tooltip>
              </TooltipTrigger>
              <View marginStart="size-500">
              <TabList height="size-400">
                {this.editor.tabs.map(({ id, name }) => (
                  <Item key={id}>{name}</Item>
                ))}
              </TabList>
              </View>
              <View marginStart="size-200">
                <Control
                  onPress={this.handlePlay.bind(this)}
                  variant="secondary"
                  isQuiet
                >
                  <Run />
                  <Text>Run</Text>
                </Control>
                <Control
                  variant="secondary"
                  isQuiet
                  onPress={this.handleReset.bind(this)}
                >
                  <Reset />
                  <Text>Reset</Text>
                </Control>
                <MenuTrigger>
                  <TooltipTrigger delay={0}>
                    <ActionButton variant="secondary"isQuiet >
                      <Export />
                    </ActionButton>
                    <Tooltip>Share</Tooltip>
                  </TooltipTrigger>
                  <Menu onAction={this.updateDialogState.bind(this)}>
                    <Item key="clipboard copy">Copy to clipboard</Item>
                    <Item key="export file">Export to file</Item>
                  </Menu>
                </MenuTrigger>
                <DialogContainer onDismiss={this.updateDialogState.bind(this)}>
                  { this.state.dialog === 'clipboard copy' && this.handleClipboardCopy() }
                  { this.state.dialog === 'export file' && this.handlePluginDownload() }
                </DialogContainer>
              </View>
            </Flex>
          </Tabs>
        </Flex>
        <Flex direction="row">
          <div id="navBar" />
          <div id={this.editorId} className="playground-editor" />
        </Flex>
      </Flex>
    );
  }
}

class Control extends React.Component {
  render() {
    const icon = this.props.children[0];
    const text = this.props.children[1];
    return (
      <TooltipTrigger delay={0}>
        <ActionButton {...this.props}>{icon}</ActionButton>
        <Tooltip>{text}</Tooltip>
      </TooltipTrigger>
    );
  }
}
