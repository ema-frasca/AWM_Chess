
global.static = "/static/";
global.imgs = global.static + "imgs/";
global.sprites = global.static + "sprites/";

// WebSocket
global.ws = null;

// Array of function to call on WebSocket connect/disconnect
global.wsOnStateChange = [];

// Array of function to call on WebSocket message, form of
// { type: "", f: function }
global.wsOnMessage = [];

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
    var ws = new WebSocket("ws://"+ window.location.host +"/ws");
    var connectInterval;

    ws.onopen = (e) => {
        console.log("WebSocket connect")
        timeout = 250;
        clearTimeout(connectInterval);
        changeWS(ws);
    };

    ws.onclose = (e) => {
        console.log("WebSocket disconnect, error " + e.reason);
        changeWS(null);

        if (timeout < 5000)
            timeout *= 2;
        connectInterval = setTimeout(check, timeout);
    };

    // On production deactivate logging errors for security reasons
    ws.onerror = (e) => {
        //console.error("WebSocket error: " + e.message);
        ws.close();
    }

    ws.onmessage = (e) => {
        const message = JSON.parse(e.data);
        global.wsOnMessage.forEach((listener) => {
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

