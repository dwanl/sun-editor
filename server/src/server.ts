import { WebSocketServer } from 'ws';
import * as http from 'http';
import * as url from 'url';
import * as net from 'net';
import * as express from 'express';
import { Appclication } from 'express'
import * as rpc from "@codingame/monaco-jsonrpc";
import { launch } from './cpp-server-launcher';

process.on('uncaughtException', (err: any) => {
  console.error('未捕获异常：' + err.toString())
  if (err.stack) {
    console.error(err.stack)
  }
})

// create express server
const port = 4200
const app: Appclication = express()
const server = http.createServer(app)

// create web socket
const wss = new WebSocketServer({
  noServer: true,
  perMessageDeflate: false
})

server.on('upgrade', (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
  const pathname = request.url ? url.parse(request.url).pathname : undefined;
  console.log('Pathname: ' + pathname)
  if (pathname === '/cpp') {
    wss.handleUpgrade(request, socket, head, webSocket => {
      const socket: rpc.IWebSocket = {
        send: content => webSocket.send(content, error => {
          if (error) throw error;
        }),
        onMessage: cb => webSocket.on('message', cb),
        onError: cb => webSocket.on('error', cb),
        onClose: cb => webSocket.on('close', cb),
        dispose: () => webSocket.close()
      };
      // launch the server when the web socket is opened
      if (webSocket.readyState === webSocket.OPEN) {
         launch(socket);
      } else {
          webSocket.on('open', () => launch(socket));
      }
    })
  }
})

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})


