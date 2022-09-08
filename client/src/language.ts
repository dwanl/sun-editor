import * as monaco from "monaco-editor";

import { listen } from "@codingame/monaco-jsonrpc";

import {
  MonacoLanguageClient,
  MessageConnection,
  CloseAction,
  ErrorAction,
  MonacoServices,
  createConnection,
} from "@codingame/monaco-languageclient";
import normalizeUrl from 'normalize-url'
import ReconnectingWebSocket from 'reconnecting-websocket';
import { CPP_KEYS } from './language/static-provider'



let connected = false;
interface Range {
  startLineNumber: number; 
  endLineNumber: number; 
  startColumn: number; 
  endColumn: number; 
}

export function registerLanguage(editor: any, rootUri: string) {
  monaco.languages.register({
    id: "cpp",
    extensions: [".cpp", ".c", ".h", ".hpp"],
    aliases: ["cpp", "CPP", "c", "C"],
  })

  //注册自动补全
  monaco.languages.registerCompletionItemProvider("cpp", {
    provideCompletionItems: (model, position) => {
      let word = model.getWordUntilPosition(position);
      const range: Range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      return {
        suggestions: getCompletionList(range, true, editor, word)
      }
    }
  })
  MonacoServices.install(editor, {
    // 工作空间，缓存所在的根目录
    rootUri: rootUri
  })
}

export function connectLanguageClient(url: string) {
  if (!connected) {
    const normalizeUrl = getUrl(url)
    const webSocket: any = createWebSocket(normalizeUrl);
    listen({
      webSocket,
      onConnection: (connection) => {
        console.log("[webSocket] connected, url: " + normalizeUrl);
        connected = true;
        // create and start the language client
        const languageClient = createLanguageClient(connection);
        const disposable = languageClient.start();
        connection.onClose(() => disposable.dispose());
      },
    });
  }
}

function getUrl(path: string): string {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  return normalizeUrl(`${protocol}://localhost:4200${path}`);
}

function createWebSocket(url: string) {
  const socketOptions = {
    // WebSocket: WS,
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000,
    connectionTimeout: 10000,
    maxRetries: Infinity,
    debug: false,
  };
  return new ReconnectingWebSocket(url, [], socketOptions);
}


function createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
  return new MonacoLanguageClient({
    name: "CPP Language Client",
    clientOptions: {
      documentSelector: ['cpp'],
      errorHandler: {
        error: () =>  ErrorAction.Continue,
        closed: () => CloseAction.DoNotRestart
      }
    },
    connectionProvider: {
      get: (errorHandler, closeHandler) => {
        return Promise.resolve(
          createConnection(connection, errorHandler, closeHandler)
        ); 
      },
    }
  })
}

function getCompletionList(
  range: Range,
  languageService = false,
  editor: any,
  curWord: monaco.editor.IWordAtPosition
) {
  const snippets = [
    {
      label: "main",
      kind: monaco.languages.CompletionItemKind.Snippet,
      documentation: "int main(int argc, char *argv[])",
      insertText: "int main(int argc, char *argv[]) {\n\t${1}\n}",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
    {
      label: "cin",
      kind: monaco.languages.CompletionItemKind.Snippet,
      documentation: "cin",
      insertText: "std::cin >> ${1:value};",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
    {
      label: "cout",
      kind: monaco.languages.CompletionItemKind.Snippet,
      documentation: "cout with endl",
      insertText: "std::cout << ${1:value} << std::endl;",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
    {
      label: "forloop",
      kind: monaco.languages.CompletionItemKind.Snippet,
      documentation: "for loop with index++",
      insertText:
        "for (auto ${1:i} = 0; ${1:i} < ${2:n}; ++${1:i}) {\n\t${3}\n}",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
    {
      label: "foreach",
      kind: monaco.languages.CompletionItemKind.Snippet,
      documentation: "for-each-in loop",
      insertText: "for (auto &${1:element}: ${2:container}) {\n\t${3}\n}",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
    {
      label: "forit",
      kind: monaco.languages.CompletionItemKind.Snippet,
      documentation: "for loop with iterator++",
      insertText:
        "for (auto it = ${1:container}.begin(); it != ${1:container}.end(); ++it) {\n\t${2}\n}",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
    {
      label: "header_wrapper",
      kind: monaco.languages.CompletionItemKind.Snippet,
      documentation: "wrapper to include this file only once",
      insertText: "#ifndef ${1}\n#define ${1}\n\n${2}\n\n#endif /* ${1} */",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
    {
      label: "include_stdcpp",
      kind: monaco.languages.CompletionItemKind.Snippet,
      documentation: "include all header for std c++",
      insertText: "#include <bits/stdc++.h>\n",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
  ];
  // let keys = [];
  // for (const item of CPP_KEYS) {
  //   keys.push({
  //     label: item,
  //     kind: monaco.languages.CompletionItemKind.Keyword,
  //     documentation: "",
  //     insertText: item,
  //     range: range,
  //   });
  // }

  // let words = [];
  // let tokens = getTokens(editor.getModel().getValue());
  // for (const item of tokens) {
  //   if (item != curWord.word) {
  //     words.push({
  //       label: item,
  //       kind: monaco.languages.CompletionItemKind.Text,
  //       documentation: "",
  //       insertText: item,
  //       range: range,
  //     });
  //   }
  // }

  // if (languageService) {
  //   return snippets;
  // } else {
  //   return snippets.concat(keys).concat(words);
  // }

  return snippets;
}


export function overrideMonaco(editor: any) {
  const editorService = editor._codeEditorService;
  const openEditorBase = editorService.openCodeEditor.bind(editorService);
  if(openEditorBase){

  }
    
  editorService.openCodeEditor = async (input: any, source: any, sideBySide: any) => { 
    const result = await openEditorBase(input, source);
    if (result === null) {
      console.log(input, source)
      const fullPath = input.resource.path
      monaco.editor.createModel('', 'CPP', monaco.Uri.file(fullPath))
      alert("file is at " + fullPath )
    }
    return result; // always return the base result
  };
}
