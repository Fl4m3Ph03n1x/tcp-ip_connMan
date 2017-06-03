"use strict";

const net = require( "net" );

const connManager = () => {

    const heartBeat = {
        interval: 3000,
        timeout: 5000,
        ping: undefined,
        pong: undefined,
        timer: undefined,
        lastHeartbeatTime: Date.now(),
        hasTimedOut: function () {
            return Date.now() - this.lastHeartbeatTime > this.timeout;
        }
    };

    const eventFns = {
        onClose: () => {},
        onRead: () => {},
        onOpen: () => {},
        onRetry: () => {}
    };

    const connection = {
        socket: undefined,
        connectFn: function ( theOpts ) {
            return new Promise( ( resolve, reject ) => {
                const socket = net.createConnection( theOpts, () => resolve( socket ) );
                socket.once( "error", err => reject( err ) );
            } );
        },
        options: undefined,
        retriesCnt: 0
    };

    const connect = async function ( connectOpts ) {
        connection.options = connectOpts;
        let done = false;
        while ( !done ) {
            try {
                connection.socket = await connection.connectFn( connectOpts );
                connection.retriesCnt = 0;
                connection.socket.on( "data", read );
                eventFns.onOpen( true );
                done = true;
            } catch ( err ) {
                connection.retriesCnt++;
                eventFns.onRetry(err, connection.retriesCnt);
            }
        }
        heartBeat.lastHeartbeatTime = Date.now();
        heartBeat.timer = setInterval( heartBeatFn, heartBeat.interval );
    };

    const heartBeatFn = function () {
        if ( heartBeat.hasTimedOut() ) {
            disconnect();
            connect( connection.options ); //attempt reconnect and restart cycle
        } else {
            send( heartBeat.ping );
        }
    };

    const disconnect = function () {
        clearInterval( heartBeat.timer );
        connection.socket.destroy();
        eventFns.onClose( false );
    };

    const read = function ( data ) {
        if ( data.equals( heartBeat.pong ) ) {
            heartBeat.lastHeartbeatTime = Date.now();
            return;
        }
        eventFns.onRead( data );
    };

    const send = function ( message ) {
        if ( connection.socket.destroyed === true )
            throw new Error( "Connection is down, message not delivered." );

        connection.socket.write( message );
    };

    const setOnClose = function ( newFn ) {
        eventFns.onClose = newFn;
    };

    const setOnOpen = function ( newFn ) {
        eventFns.onOpen = newFn;
    };

    const setOnRead = function ( newFn ) {
        eventFns.onRead = newFn;
    };

    const setOnRetry = function ( newFn ) {
        eventFns.onRetry = newFn;
    };

    const setConnectFn = function ( newFn ) {
        connection.connectFn = newFn;
    };

    const setPing = function ( newPing ) {
        heartBeat.ping = newPing;
    };

    const setPong = function ( newPong ) {
        heartBeat.pong = newPong;
    };

    return Object.freeze( {
        connect,
        disconnect,
        send,
        setOnClose,
        setOnOpen,
        setOnRead,
        setOnRetry,
        setConnectFn,
        setPong,
        setPing
    } );
};

module.exports = connManager;
