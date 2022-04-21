import * as monaco from 'monaco-editor/esm/vs/editor/editor.main';
import _ from 'lodash';
import * as path from 'path';
import JSZip from 'jszip';
import YAML from 'js-yaml';
import { prettyPrint } from 'html'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { readFile, getCurrentWorkingDirectory } from '../utils/FileApi';
import { types } from '../../types/TypeDefns';

toast.configure()

const HTML_CODE = `<!DOCTYPE html>
<html>
    <head>
        <title>Hello</title>
    </head>
    <body>
        <h1>Welcome</h1>
    </body>
</html>
`;
const JAVASCRIPT_CODE = `// comment
console.log("Hello World!");
`;
const CSS_CODE = `body { 
    background-color: aquamarine 
}
`;
const JSON_CODE = `{
}
`;

export const tabs = [
  {
    id: 'html',
    name: 'HTML',
    label: 'Template',
    language: 'html',
    fileName: 'index.html',
    defaultValue: HTML_CODE
  },
  {
    id: 'css',
    name: 'CSS',
    label: 'Style',
    language: 'css',
    fileName: 'style.css',
    defaultValue: CSS_CODE
  },
  {
    id: 'ui_javascript',
    name: 'UI Javascript',
    label: 'UI Javascript',
    language: 'javascript',
    fileName: 'ui_index.js',
    defaultValue: JAVASCRIPT_CODE
  },
  {
    id: 'javascript',
    name: 'Script',
    label: 'Script',
    language: 'javascript',
    fileName: 'index.js',
    defaultValue: JAVASCRIPT_CODE
  },
  {
    id: 'json',
    name: 'Manifest',
    label: 'Manifest',
    language: 'json',
    fileName: 'manifest.json',
    defaultValue: JSON_CODE,
    disableWatch: true
  }
];
export const defaultTabId = tabs[0].id;
export const monacoTheme = {
  light: 'vs',
  dark: 'vs-dark'
};

let currentCount = 0;

export default class PlayGround {
  constructor() {
    if (PlayGround.instance instanceof PlayGround) {
      return PlayGround.instance;
    }
    this.compilerOptions = monaco.languages.typescript.javascriptDefaults.getCompilerOptions();
    this.id = ++currentCount;
    this.fetchAndSetCurrentWorkingDirectory();
    setTimeout(() => {
      this.editorData = this.createDefaultEditorModels();
    }, 100);
    PlayGround.instance = this;
  }

  disableDefaultIntellisense() {
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ noLib: true, allowNonTsExtensions: true });
  }

  enableDefaultIntellisense() {
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions(this.compilerOptions);
  }

  async fetchAndSetCurrentWorkingDirectory() {
    const response = await getCurrentWorkingDirectory();
    this.currentDir = response.toString();
  }

  static async addExtraLibraries() {
    for (const moduleName in types) {
        const libSource = types[moduleName];
        const libUri = `ts:types/${moduleName}.d.ts`;
        // support intellisense - peek definitions/references
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
            libSource,
            libUri
        );
        monaco.editor.createModel(
            libSource,
            "typescript",
            monaco.Uri.parse(libUri)
        );
    }
  }

  createDefaultEditorModels() {
    const editorData = {};
    for (const { id, language, fileName, defaultValue } of tabs) {
      editorData[id] = { model: null, state: null, defaultCode: '' };
      let code = defaultValue;
      readFile(
          path.join(
            this.currentDir,
            "samples/PollWidget",
            fileName
          )
        )
        .then(response => {
          code = response.toString();
          editorData[id].model = monaco.editor.createModel(code, language);
          editorData[id].defaultCode = code;
        });
    }
    return editorData;
  }

  createInstance(element, { tabId, theme }) {
    const editorInstance = monaco.editor.create(element, {
      model: this.editorData[tabId].model,
      theme: monacoTheme[theme]
    });
    return editorInstance;
  }

  saveTab(editorInstance, id) {
    const currTab = this.editorData[id];
    currTab.model = editorInstance.getModel();
    currTab.state = editorInstance.saveViewState();
  }

  restoreTab(editorInstance, id) {
    const newTab = this.editorData[id];
    editorInstance.setModel(newTab.model);
    editorInstance.restoreViewState(newTab.state);
  }

  resetCode() {
    for (const { id } of tabs) {
      const tabData = this.editorData[id];
      tabData.model.setValue(tabData.defaultCode);
    }
  }

  generateMergedUiFile() {
    var htmlCode = this.editorData['html'].model.getValue();
    const cssCode = this.editorData['css'].model.getValue();
    const uiJsCode = this.editorData['ui_javascript'].model.getValue();
    const bodyTagIndex = htmlCode.lastIndexOf("<body>");
    if (bodyTagIndex !== -1) {
      htmlCode = prettyPrint(htmlCode.substring(0, bodyTagIndex+6) +
                            `\n<style>${'\n' + cssCode + '\n'}</style>` +
                            `\n<script>${'\n' + uiJsCode + '\n'}</script>` +
                            htmlCode.substring(bodyTagIndex+6));
    }
    return htmlCode;
  }

  downloadPlugin() {
    const zip = new JSZip();
    const zipFolder = zip.folder("Playground_Plugin");
    var pluginCode = "";
    for (let { id, fileName } of tabs) {
      if (id === "css" || id === "ui_javascript") {
        continue;
      }
      if (id === 'html') {
        pluginCode = this.generateMergedUiFile();
      } else {
        pluginCode = this.editorData[id].model.getValue();
      }
      zipFolder.file(fileName, pluginCode);
    }
    zip.generateAsync({type:"blob"}).then(function(content) {
      var blob = new Blob([content], {type: "application/zip"});
      var url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = "Playground_Plugin.zip";
      anchor.style = "display: none";
      anchor.click();
    });
  }

  sendPluginToParent() {
    const pluginData = {};
    for (const { id } of tabs) {
      if (id !== "css" && id !== "ui_javascript") {
        pluginData[id] = this.editorData[id].model.getValue();
      }
    }
    pluginData['html'] = this.generateMergedUiFile();
    window.parent.postMessage(pluginData, '*');
  }

  createSnippetFromPlugin() {
    var snippet = {};
    for (const { id, label } of tabs) {
      if (id !== "css" && id !== "ui_javascript") {
        snippet[label] = {content: this.editorData[id].model.getValue(), language: id};
      }
      snippet['Template'] = {content: this.generateMergedUiFile(), language: 'html'};;
    }
    return YAML.dump(snippet);
  }

  copyToClipboard() {
    const yamlSnippet = this.createSnippetFromPlugin();
    navigator.clipboard.writeText(yamlSnippet)
      .then(() => toast.success("Copied to clipboard", { autoClose: false }))
      .catch(() => toast.error("Copy to clipboard failed", { autoClose: false }));
  }

  setPluginCodeInEditor(filePath) {
    for (const { id, fileName } of tabs) {
      let code = "";
      readFile(path.join(filePath, fileName))
      .then(response => {
        code = response.toString();
        this.editorData[id].model.setValue(code);
      });
    }
  }

}
