"use strict";

const net = require("net");

const connection = () => {

    let socket, retriesCnt;

    let connectFn = function(theOpts) {
        return new Promise((resolve, reject) => {
            socket = net.createConnection(theOpts, () => resolve(socket));
            socket.once("error", err => reject(err));
        });
    };
    
    const getRetriesCnt = () => retriesCnt;  
    
    return {
        getRetriesCnt,
        connectFn
    };
};

module.exports = connection;
