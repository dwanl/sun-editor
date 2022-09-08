/** 
 * cpp server launcher
 * 转发
 */

import * as path from 'path';
import * as rpc from '@codingame/monaco-jsonrpc';
import * as server from '@codingame/monaco-jsonrpc/lib/server'
import * as lsp from 'vscode-languageserver';


export function launch(socket: rpc.IWebSocket) {
  // open web socket
  const reader = new rpc.WebSocketMessageReader(socket);
  const wirter = new rpc.WebSocketMessageWriter(socket);

  const socketConnection: server.IConnection = server.createConnection(reader, wirter, () =>  socket.dispose())
  // 作为一个外部进程启动语言服务器
  const command = path.resolve(__dirname, '../',  './lib/ccls.exe')
  console.log("Exe path: " + command)
  const args = {
    "capabilities": {
      "foldingRangeProvider": false
    },
    "index": {
      "onChange": true,
      "trackDependency": 2
    },
  }
  const serverConnection: server.IConnection = server.createServerProcess('CPP', 'ccls', [`--init=${JSON.stringify(args)}`])
  // 进行转发
  server.forward(socketConnection, serverConnection, message => { 
    console.log('Cpp lsp connected.')
    if (rpc.isRequestMessage(message)) {
      if (message.method === lsp.InitializeRequest.type.method) {
        console.log('message.method-------------------------', message.method)
        const initializeParams = message.params as lsp.InitializeParams
        initializeParams.processId = process.pid
      }
    }
    return message;
  })
}

