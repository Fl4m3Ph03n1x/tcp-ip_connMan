"use strict";

const heartBeat = () => {

    let interval = 3000,
        timeout = 5000,
        ping,
        pong,
        timer,
        lastHeartbeatTime = Date.now();

    const hasTimedOut = () =>
        Date.now() - this.lastHeartbeatTime > this.timeout;


    const getInterval = () => interval;
    const setInterval = newInterval => {
        interval = newInterval;
    };

    const getTimeout = () => timeout;
    const setTimeout = newTimeout => {
        timeout = newTimeout;
    };

    const getPing = () => ping;
    const setPing = newPing => {
        ping = newPing;
    };

    const getPong = () => pong;
    const setPong = newPong => {
        pong = newPong;
    };

    return {

    };
};

module.exports = heartBeat;
