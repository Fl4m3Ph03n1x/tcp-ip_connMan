const net = require("net");
const heartBeatFactory = require("heartbeatjs");
const isFunction = require("lodash.isfunction");
const errors = require("./errors.js");
const cbException = errors.callbackNotAFunction;
const connectHandlerNotAFunction = errors.connectHandlerNotAFunction;


/**
 *  @public
 *  @author Pedro Miguel P. S. Martins
 *  @version 1.0.0
 *  @module connManager
 *  @desc   Takes care of remote tcp-ip connections by attempting automatic
 *          reconnects and handling timeouts.
 */
const connManager = (heartBeat = heartBeatFactory()) => {

    if (heartBeat.getPing() === undefined)
        heartBeat.setPing(Buffer.from([0x01]));

    if (heartBeat.getPong() === undefined)
        heartBeat.setPong(Buffer.from([0x02]));

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

    /**
     *  @public
     *  @func       connect
     *  @param      {Object}    connectOpts An object with connect options. This
     *                                      is the object that will be passed to
     *                                      <code>connectFn</code> to attempt
     *                                      connect. The default
     *                                      <code>connectFn</code> makes a socket
     *                                      connection, so the connections
     *                                      object passed to the default should
     *                                      be the one used is
     *                                      <code>net.createConnection()</code>.
     *  @returns    {Promise}
     *  @throws     {Error}     If there is no connection options. There must
     *                          always be a <code>connectOpts</code> parameter.
     *
     *  @description    <p>
     *                      Attempts to connect to the tcp-ip server provided
     *                      with the given options.
     *                  </p>
     *                  <p>
     *                      It will not resolve until a connection is made. Once
     *                      a connection is made it fires <code>onOpen</code>,
     *                      and every time it retries to establish a connection
     *                      it fires <code>onRetry()</code>.
     *                  </p>
     *                  <p>
     *                      Once a connection is established, it starts the
     *                      heartbeat to periodically check the health of the
     *                      target. If the connection dies or times out, it
     *                      fires <code>onClose</code> and automatic
     *                      reconnection is attempted, called
     *                      <code>onRetry</code> for every failed attempt.
     *                  </p>
     *
     *  @see            {@link https://nodejs.org/api/net.html#net_net_createconnection|net.createConnection()}
     *  @see            <code>onOpen</code>
     *  @see            <code>onRetry</code>
     *  @see            <code>onClose</code>
     */
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
        heartBeat.onTimeout(reconnect);
        heartBeat.start(pingFn);
    };

    const pingFn = function() {
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

    /**
     *  @public
     *  @func       disconnect
     *
     *  @description    Kills the connection to the target, stops the heartbeat
     *                  and fires <code>onClose</code>
     *  @see            <code>onClose</code>
     */
    const disconnect = function() {
        heartBeat.stop();
        connection.socket.destroy();
        eventFns.onClose(false);
    };

    /**
     *  @public
     *  @func       isConnected
     *  @returns    {Boolean}   <code>true</code> if the connection is up,
     *                          <code>false</code> otherwise.
     *
     *  @description    Returns <code>true</code> if the connection is up,
     *                  <code>false</code> otherwise. If a reconnection is taking
     *                  place, it will still return <code>false</code>.
     */
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

    /**
     *  @public
     *  @func       send
     *  @param      {Object}    message     The message object we want to send.
     *  @throws     {Error}     If the connection is down. You can check this
     *                          via <code>isConnected</code>.
     *
     *  @description    Sends a message to the target.
     *  @see            <code>isConnected</code>
     */
    const send = function(message) {
        if (connection.socket.destroyed)
            throw new Error("Connection is down, message not delivered.");

        connection.socket.write(message);
    };

    /**
     *  @public
     *  @func       onClose
     *  @param      {Function}  newFn   The function to run when the
     *                                  <b>onClose</b> event is fired.
     *  @throws     {CallbackNotAFunction} If <code>newFn</code> is not a function.
     *
     *  @description    Runs the given function every time the <b>onClose</b>
     *                  event is triggered, passing it the argument
     *                  <code>false</code>.
     */
    const onClose = function(newFn) {
        if (!isFunction(newFn))
            throw cbException(newFn, "onClose");
        eventFns.onClose = newFn;
    };

    /**
     *  @public
     *  @func       onOpen
     *  @param      {Function}  newFn   The function to run when the
     *                                  <b>onOpen</b> event is fired.
     *  @throws     {CallbackNotAFunction} If <code>newFn</code> is not a function.
     *
     *  @description    Runs the given function every time the <b>onOpen</b>
     *                  event is triggered, passing it the argument
     *                  code>true</code>.
     */
    const onOpen = function(newFn) {
        if (!isFunction(newFn))
            throw cbException(newFn, "onOpen");
        eventFns.onOpen = newFn;
    };

    /**
     *  @public
     *  @func       onRead
     *  @param      {Function}  newFn   The function to run when the
     *                                  <b>onRead</b> event is fired.
     *  @throws     {CallbackNotAFunction} If <code>newFn</code> is not a function.
     *
     *  @description    Runs the given function every time the <b>onRead</b>
     *                  event is triggered, passing it the received data as
     *                  an argument.
     */
    const onRead = function(newFn) {
        if (!isFunction(newFn))
            throw cbException(newFn, "onRead");
        eventFns.onRead = newFn;
    };

    /**
     *  @public
     *  @func       onRetry
     *  @param      {Function}  newFn   The function to run when the
     *                                  <b>onRetry</b> event is fired.
     *  @throws     {CallbackNotAFunction} If <code>newFn</code> is not a function.
     *
     *  @description    Runs the given function every time the <b>onRetry</b>
     *                  event is triggered, passing it the error that caused the
     *                  retry, as well as a count of the number of retries.
     */
    const onRetry = function(newFn) {
        if (!isFunction(newFn))
            throw cbException(newFn, "onRetry");
        eventFns.onRetry = newFn;
    };

    /**
     *  @public
     *  @func       setConnectFn
     *  @param      {Function}      newFn   The function to be used when
     *                                      <code>connect</code> is called and
     *                                      every time automatic reconnection
     *                                      takes place.
     *  @throws     {ConnectHandlerNotAFunction} If <code>newFn</code> is not a function.
     *
     *  @description    Used when you need to custom connect function because
     *                  the target has a specific handshake or protocol. The
     *                  function passed must return the socket used for the
     *                  connection.
     */
    const setConnectFn = function(newFn) {
        if (!isFunction(newFn))
            throw connectHandlerNotAFunction(newFn);
        connection.connectFn = newFn;
    };



    return Object.freeze({
        connect,
        disconnect,
        isConnected,
        send,
        onClose,
        onOpen,
        onRead,
        onRetry,
        setConnectFn
    });
};

module.exports = connManager;
