
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
}

function connect() {
    var ws = new WebSocket("ws://"+ window.location.host +"/ws");
    var connectInterval;

    ws.onopen = (e) => {
        console.log("WebSocket connect")
        changeWS(ws);
        timeout = 250;
        clearTimeout(connectInterval);
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
        console.error("WebSocket error: " + e.message);
        ws.close();
    }

    ws.onmessage = (e) => {
        global.wsOnMessage.forEach((f) => f(e));
    }

}

function check() {
    let ws = global.ws;
    if (!ws || (ws.readyState === WebSocket.CLOSED))
        connect();
}

