import express from 'express';
const app = express();
import { matchRouter } from './routes/matches.js'
const port = process.env.PORT || 8000;
const host = process.env.HOST || '0.0.0.0'
import http from 'http'
import { attachWebSocketServer } from './ws/server.js';

app.use(express.json());

const server = http.createServer(app)
app.get('/', (req, res) => {
    res.send('helo');
})

app.use("/matches", matchRouter)

const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(port, host, () => {
    const baseUrl = host === '0.0.0.0' ? `http://localhost:${port}` : `http://${host}:${port}`;
    console.log(`server is running on ${baseUrl}`)
    console.log(`Websocket server is running on ${baseUrl.replace('http', 'ws')}/ws`)
})