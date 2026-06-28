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


    wss.on('connection', async (socket, req) => {

        if (wsArcjet) {
            try {
                const decision = await wsArcjet.protect(req);
                if (decision.isDenied()) {
                    const code = decision.reason.isRateLimit() ? 1013 : 1008; //1013 rate limit reached try again later and 1008 a bot is dectcted
                    const reason = decision.reason.isRateLimit() ? 'Rate limit reached' : 'acces denied';

                    socket.close(code, reason);
                    return;
                }
            } catch (e) {
                console.error(`ws connection failure`, e)
                socket.close(1011, 'server security error');
                return;
            }



        }



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