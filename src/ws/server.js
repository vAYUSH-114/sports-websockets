import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../arcjet.js";

//send the json to those servber which is open
function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return

    socket.send(JSON.stringify(payload));

}

//broadcast to all connected server
function broadcast(wss, payload) {
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

        sendJson(socket, { type: 'welcome' });
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
        broadcast(wss, { type: 'match_created', data: match })
    }

    return { broadcastMatchCreated };

}
