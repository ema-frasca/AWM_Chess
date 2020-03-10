
global.static = "/static/";
global.imgs = global.static + "imgs/";
global.sprites = global.static + "sprites/";

// WebSocket
global.ws = null;

// Array of function to call on WebSocket connect/disconnect
global.wsOnStateChange = [];

// Array of function to call on WebSocket message, form of
// id: { type: "", f: function }
global.wsOnMessage = new Map();

let timeout = 250;
connect();

function changeWS(ws) {
    global.ws = ws;
    global.wsOnStateChange.forEach((f) => f());
    if (ws)
        send_buffer();
}

let buffer = [];

global.wsSend = (obj) => {
    if (global.ws)
        global.ws.send(JSON.stringify(obj));
    else 
        buffer.push(obj);
}

function send_buffer() {
    while (buffer.length > 0) {
        const obj = buffer.pop();
        global.wsSend(obj);
    }
}

function connect() {
    var host = "192.168.1.108:8000";
    var ws = new WebSocket("ws://"+ host +"/mobile-ws");
    var connectInterval;

    ws.onopen = (e) => {
        timeout = 250;
        clearTimeout(connectInterval);
        changeWS(ws);
    };

    ws.onclose = (e) => {
        changeWS(null);

        if (timeout < 5000)
            timeout *= 2;
        connectInterval = setTimeout(check, timeout);
    };

    ws.onerror = (e) => {
        ws.close();
    }

    ws.onmessage = (e) => {
        const message = JSON.parse(e.data);
        global.wsOnMessage.forEach((listener, key) => {
            if (listener.type === message.type)
                listener.f(message);
        });
    }

}

function check() {
    let ws = global.ws;
    if (!ws || (ws.readyState === WebSocket.CLOSED))
        connect();
}

