"use strict";

const net = require("net");
const isFunction = require("lodash.isfunction");

const connManager = aHeartBeat => {
    const heartBeat = aHeartBeat;

    const eventFns = {
        onClose: () => {},
        onRead: () => {},
        onOpen: () => {},
        onRetry: () => {}
    };

    const connection = {
        socket: undefined,
        connectFn: function(theOpts) {
            return new Promise((resolve, reject) => {
                const socket = net.createConnection(theOpts, () => resolve(socket));
                socket.once("error", err => reject(err));
            });
        },
        options: undefined,
        retriesCnt: 0
    };

    const connect = async function(connectOpts) {
        if (connectOpts === undefined)
            throw new Error("connect must have options");
        
        connection.options = connectOpts;
        let done = false;
        while (!done) {
            try {
                connection.socket = await connection.connectFn(connectOpts);
                connection.retriesCnt = 0;
                connection.socket.on("data", read);
                eventFns.onOpen(true);
                done = true;
            }
            catch (err) {
                connection.retriesCnt++;
                eventFns.onRetry(err, connection.retriesCnt);
            }
        }
        heartBeat.start(pingFn);
    };

    const pingFn = function() {
        if (heartBeat.hasTimedOut()) {
            reconnect();
            return;
        }
        
        try {
            send(heartBeat.getPing());
        }
        catch (err) {
            //the connection died as we were pinging
            reconnect();
        }
    };

    const reconnect = () => {
        disconnect();
        connect(connection.options); //attempt reconnect and restart cycle
    };

    const disconnect = function() {
        heartBeat.stop();
        connection.socket.destroy();
        eventFns.onClose(false);
    };

    const isConnected = function() {
        return heartBeat.isBeating() && !connection.socket.destroyed;
    };

    const read = function(data) {
        if (data.equals(Buffer.from(heartBeat.getPong()))) {
            heartBeat.receivedPong();
            return;
        }
        eventFns.onRead(data);
    };

    const send = function(message) {
        if (connection.socket.destroyed)
            throw new Error("Connection is down, message not delivered.");

        connection.socket.write(message);
    };

    const setOnClose = function(newFn) {
        if (!isFunction(newFn))
            throw new TypeError(`${newFn} must be a function.`);
        eventFns.onClose = newFn;
    };

    const setOnOpen = function(newFn) {
        if (!isFunction(newFn))
            throw new TypeError(`${newFn} must be a function.`);
        eventFns.onOpen = newFn;
    };

    const setOnRead = function(newFn) {
        if (!isFunction(newFn))
            throw new TypeError(`${newFn} must be a function.`);
        eventFns.onRead = newFn;
    };

    const setOnRetry = function(newFn) {
        if (!isFunction(newFn))
            throw new TypeError(`${newFn} must be a function.`);
        eventFns.onRetry = newFn;
    };

    const setConnectFn = function(newFn) {
        if (!isFunction(newFn))
            throw new TypeError(`${newFn} must be a function.`);
        connection.connectFn = newFn;
    };

    return Object.freeze({
        connect,
        disconnect,
        isConnected,
        send,
        setOnClose,
        setOnOpen,
        setOnRead,
        setOnRetry,
        setConnectFn
    });
};

module.exports = connManager;
