"use strict";

const net = require( "net" );

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

module.exports = connection;