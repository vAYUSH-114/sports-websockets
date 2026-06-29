import express from 'express';
const app = express();
import { matchRouter } from './routes/matches.js'
const port = process.env.PORT || 8000;
const host = process.env.HOST || '0.0.0.0'
import http from 'http'
import { attachWebSocketServer } from './ws/server.js';
import { securityMiddleware } from './arcjet.js';
import { commentryRouter } from './routes/commentry.js';

app.use(express.json());

const server = http.createServer(app)
app.get('/', (req, res) => {
    res.send('helo');
})

app.use(securityMiddleware());

app.use("/matches", matchRouter)
app.use("/matches/:id/commentry", commentryRouter)

//stored it into the locals so that can be get anywhere we  need and can broacast.
const { broadcastMatchCreated, broadcastCommentry } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentry = broadcastCommentry;

server.listen(port, host, () => {
    const baseUrl = host === '0.0.0.0' ? `http://localhost:${port}` : `http://${host}:${port}`;
    console.log(`server is running on ${baseUrl}`)
    console.log(`Websocket server is running on ${baseUrl.replace('http', 'ws')}/ws`)
})