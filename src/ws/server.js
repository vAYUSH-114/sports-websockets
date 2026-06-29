import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../arcjet.js";

const matchSubscribers = new Map(); //not adding twice to the server

function subscribe(matchId, socket) {
    if (!matchSubscribers.has(matchId)) {
        matchSubscribers.set(matchId, new Set());
    }
    matchSubscribers.get(matchId).add(socket);
}

function unsubscribe(matchId, socket) {
    const subscribers = matchSubscribers.get(matchId);
    if (!subscribers) return;
    matchSubscribers.delete(socket);
    if (subscribers.size() == 0) {
        matchSubscribers.delete(matchId);
    }
}




function cleanupSubscriptions(socket) {
    for (const matchId of socket.subscriptions) {
        unsubscribe(matchId, socket);
    }
}

//send the json to those servber which is open
function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return

    socket.send(JSON.stringify(payload));

}

function broadcastToMatch(matchId, payload) {
    const subscribers = matchSubscribers.get(matchId);
    if (!subscribers || subscribers.size === 0) return;

    const msg = JSON.stringify(payload);

    for (const client of subscribers) {
        if (client.readyState === WebSocket.OPEN) client.send(msg);
    }

}



function handleMessage(socket, data) {
    let msg;
    try {
        msg = JSON.parse(data.toString());
        
    } catch (e) {
        // sendJson(socket, { type: 'error', message: 'Invalid json' });
    }
    if (msg?.type === "subscribe" && Number.isInteger(msg.matchId)) {
        subscribe(msg.matchId, socket);
        socket.subscriptions.add(msg.matchId);
        sendJson(socket, { type: 'subscribed', matchId: msg.matchId })
        return;
    }

    if (msg?.type === "unsubscribe" && Number.isInteger(msg.matchId)) {
        unsubscribe(msg.matchId, socket);
        socket.subscriptions.delete(msg.matchId);
        sendJson(socket, { type: 'unsubscribed', matchId: msg.matchId })
        return;
    }

}

//broadcast to all connected server
function broadcastToAll(wss, payload) {
    for (const client of wss.clients) {
        //continue instead of return cause return exit the whole function while continue will do for those who arent open
        // if (client.readyState !== WebSocket.OPEN) return

        if (client.readyState !== WebSocket.OPEN) continue // or use above function sendJson(client,payload) 
        client.send(JSON.stringify(payload));
    }
}

export function attachWebSocketServer(server) {

    // we are using the same server/ http server for requesting for websocket
    const wss = new WebSocketServer({
        server,
        path: "/ws",
        maxPayload: 1024 * 1024,
    })

    const upgradeTimeoutMs = 2000;

    function isWsUpgradeForThisServer(req) {
        // ws may be mounted behind a proxy; keep matching minimal & robust
        if (!req.url) return false;
        const [pathname] = req.url.split('?');
        return pathname === '/ws';
    }


    if (wsArcjet) {
        server.on('upgrade', (req, socket, head) => {
            if (!isWsUpgradeForThisServer(req)) return;

            let settled = false;
            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                try {
                    socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
                } catch { }
                socket.destroy();
            }, upgradeTimeoutMs);

            (async () => {
                try {
                    const decision = await wsArcjet.protect(req);
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);

                    if (decision.isDenied()) {
                        const statusCode = decision.reason.isRateLimit() ? 429 : 403;
                        const body = decision.reason.isRateLimit() ? 'Rate limit reached' : 'Access denied';
                        try {
                            socket.write(
                                `HTTP/1.1 ${statusCode} ${statusCode === 429 ? 'Too Many Requests' : 'Forbidden'}\r\n` +
                                'Content-Type: text/plain\r\n' +
                                'Connection: close\r\n' +
                                `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n` +
                                body
                            );
                        } catch { }
                        socket.destroy();
                        return;
                    }

                    wss.handleUpgrade(req, socket, head, (ws) => {
                        wss.emit('connection', ws, req);
                    });
                } catch (e) {
                    console.error(`ws upgrade security failure`, e)
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);
                    try {
                        socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
                    } catch { }
                    socket.destroy();
                }
            })();
        });


    }

    wss.on('connection', async (socket, req) => {
        socket.isAlive = true;
        socket.on('pong', () => { socket.isAlive = true; });

        socket.subscriptions = new Set();

        sendJson(socket, { type: 'welcome' });

        socket.on('message', (data) => {
            handleMessage(socket, data);
        })
        socket.on('error', () => {
            socket.terminate();
        })
        socket.on('close', () => {
            cleanupSubscriptions(socket);
        });
        socket.on('error', () => {
            console.error
        });
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping();
        })
    }, 30000);

    wss.on('close', () => clearInterval(interval));
    // after creating a new match do broadcasting (connection is open) so that all user can see.
    function broadcastMatchCreated(match) {
        broadcastToAll(wss, { type: 'match_created', data: match })
    }

    function broadcastCommentry(matchId, comment) {
        broadcastToMatch(matchId, { type: 'commentry', data: comment })
    }
    return { broadcastMatchCreated, broadcastCommentry };

}
