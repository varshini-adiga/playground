import Playground, { tabs, defaultTabId, monacoTheme } from './Playground';

const path = require('path');

export default class EditorView {
  selectedTabId = defaultTabId;

  constructor() {
    this.playground = new Playground();
    this.tabs = tabs;
    this.editorInstance = null;
    Playground.addExtraLibraries();
  }

  mount(element, { theme }) {
    const editorInstance = this.playground.createInstance(element, {
      tabId: this.selectedTabId,
      theme
    });
    editorInstance.focus();
    const resizeObserver = new ResizeObserver(() => {
      editorInstance.layout();
    });
    this.editorInstance = editorInstance;
    return resizeObserver;
  }

  update({ theme }) {
    this.editorInstance.updateOptions({ theme: monacoTheme[theme] });
  }

  unmount() {
    this.editorInstance.dispose();
  }

  downloadPlugin() {
    this.playground.downloadPlugin();
  }

  reset() {
    this.playground.resetCode();
  }

  sendPluginToParent() {
    this.playground.sendPluginToParent();
  }

  copyToClipboard() {
    this.playground.copyToClipboard();
  }

  get pluginPath() {
    return path.join(this.playground.pluginFolderPath, 'manifest.json');
  }

  setTab(id) {
    id === "javascript" ? this.playground.disableDefaultIntellisense() : this.playground.enableDefaultIntellisense();
    this.playground.saveTab(this.editorInstance, this.selectedTabId);
    this.playground.restoreTab(this.editorInstance, id);
    this.editorInstance.focus();
    this.selectedTabId = id;
  }
}
