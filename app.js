const fs = require("fs");
const http = require("http");
const path = require("path");
const { Server, OPEN } = require("ws");
const { createServer, createConnection } = require("net");

// Class to manage P2P connections and WebSockets
class PeerToPeer {
    constructor() {
        this.ws = null;
        this.WS_PORT = process.env.PORT || 3000;
        this.NET_HOST = process.env.HOST || "0.0.0.0";
        this.NET_PORT = parseInt(this.WS_PORT) + 1;
        this.conections = []
        this.socketsConnecteds = [];

        let { serverNet, serverHttp } = this.createServers();
        this.initializeWebconnectSocket(serverHttp);

        // Start the TCP and HTTP servers
        serverNet.listen({ host: this.NET_HOST, port: this.NET_PORT }, () => {
            serverHttp.listen({ host: this.NET_HOST, port: this.WS_PORT }, () => {
                console.log(`\n- Server Run in ${this.NET_HOST}:${this.NET_PORT}`);
                console.log(`- WebSite in http://localhost:${this.WS_PORT}\n`);
            });
        });
        serverNet.on("error", (error) => console.error("Server error:", error.message));
    }

    sendMessage(data) {
        const msgModel = new MessageModel(JSON.parse(data.toString()));

        if (msgModel.type === "CONNECTION") {
            this.connectSocket(msgModel.message)
        }
        if (msgModel.type === "MESSAGE") {
            this.socketsConnecteds.forEach((socket) => {
                try {
                    if (!socket._writableState.ended) {
                        socket.write(data.toString().trim());
                    }
                    this.ws.clients.forEach((client) => {
                        if (client.readyState === OPEN) client.send(msgModel.formatMessage());
                    });
                } catch (error) { console.error(error); }
            });
        }

    }

    // Attempt to connect to a peer using the provided credentials
    connectSocket(credentials) {
        try {
            let [P_HOST, P_PORT] = credentials.split(':');
            P_PORT = parseInt(P_PORT) + 1;

            this.connectPeer(P_HOST, P_PORT, {
                port: P_PORT,
                host: P_HOST
            }, {
                port: this.NET_PORT,
                host: this.NET_HOST
            });
            console.log(`\x1b[32m[+] Connected to peer\x1b[0m ${P_HOST}:${P_PORT}`);
        } catch (error) {
            console.error("Failed to connect to peer:", error);
        }
    }

    // Establish connection with a peer and maintain the list of active peers
    connectPeer(host, port, data, myCredentials) {
        try {
            const _socket = createConnection({ host, port }, () => {
                if (data.length > 0) {
                    this.conections.concat(data);
                } else {
                    const exists = this.conections.some(item => item.port === data.port && item.host === data.host || this.NET_PORT === data.port && this.NET_HOST === data.host);
                    if (!exists) {
                        this.conections.push(data)
                        this.socketsConnecteds.push(_socket);
                        console.log(`\x1b[32m[+] Connection | \x1b[0m ${data.host}:${data.port}`);
                    } else {
                        this.ws.clients.forEach((item) => {
                            let _model = new MessageModel(data)
                            if (item.readyState === OPEN) item.send(_model.formatMessage())
                        });
                    }
                }
                _socket.write(JSON.stringify(myCredentials || this.conections));
            })
        } catch (error) { }
    }

    // Connect to multiple peers from the received data
    connectMultiplePeers(data) {
        for (const connection of data) {
            const isCurrentHost = connection.port === process.env.PORT;
            const isValidConnection = connection.port !== undefined && connection.host !== undefined;
            const isNotConnected = !this.conections.some(peer => peer.port === connection.port && peer.host === connection.host);

            if (!isCurrentHost && isValidConnection && isNotConnected) {
                this.connectPeer(
                    connection.host,
                    connection.port,
                    data,
                    { port: this.NET_PORT, host: this.NET_HOST }
                );
            }
        }
    }

    // Create the TCP and HTTP servers for P2P and WebSockets
    createServers() {
        const serverNet = createServer((socket) => {
            socket.on("data", (buffer) => {
                try {
                    const data = JSON.parse(buffer.toString());
                    if (data.length) {
                        this.connectMultiplePeers(data);
                    } else {
                        this.connectPeer(socket.remoteAddress, data.port, data);
                    }
                } catch (error) {
                    const data = buffer.toString();
                    console.log(`\x1b[33m  - \x1b[0m ERROR ${error}${data}`);
                }
            });
            socket.on("close", () => console.log(`Socket closed`));
        });

        const serverHttp = http.createServer((req, res) => {
            let filePath = path.join(__dirname, "public", req.url === "/" ? "index.html" : req.url);
            let extname = path.extname(filePath);
            let contentType = "text/html";
            switch (extname) {
                case ".css":
                    contentType = "text/css";
                    break;
            }
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    if (err.code == "ENOENT") {
                        fs.readFile(path.join(__dirname, "public", "404.html"), (err, data) => {
                            res.writeHead(404, { "Content-Type": "text/html" });
                            res.end(data, "utf8");
                        });
                    } else {
                        res.writeHead(500);
                        res.end(`Server Error: ${err.code}`);
                    }
                } else {
                    res.writeHead(200, { "Content-Type": contentType });
                    res.end(data, "utf8");
                }
            });
        });
        
        return { serverHttp, serverNet }
    }

    // Initialize WebSocket server
    initializeWebconnectSocket(server) {
        this.ws = new Server({ server });

        this.ws.on("connection", (socket) => {
            socket.on("message", (data) => this.sendMessage(data));
            socket.on("close", () => console.log("WebSocket client disconnected"));
        });
    }
}

// Model for handling and formatting messages
class MessageModel {
    constructor({ message, username, voice, host, port, type }) {
        this.type = type;
        this.host = host || null;
        this.port = port || null;
        this.voice = voice;
        this.message = message;
        this.username = username;
    }

    // Format the message into JSON format
    formatMessage() {
        return JSON.stringify({
            type: this.type,
            port: this.port,
            host: this.host,
            voice: this.voice,
            message: this.message,
            username: this.username,
        });
    }
}

// Initialize the P2P server
new PeerToPeer()
