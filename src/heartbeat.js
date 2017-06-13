"use strict";

const isFunction = require("lodash.isfunction");

const heartBeatFactory = (aPing, aPong) => {

    const DEFAULT = {
        TIMEOUT: 5000,
        INTERVAL: 3000
    };

    let interval = DEFAULT.INTERVAL,
        timeout = DEFAULT.TIMEOUT,
        ping = aPing,
        pong = aPong,
        timer,
        lastHeartbeatTime;

    const hasTimedOut = () =>
        Date.now() - lastHeartbeatTime > timeout;

    const getBeatInterval = () => interval;
    const setBeatInterval = newInterval => {
        interval = newInterval;
    };

    const getBeatTimeout = () => timeout;
    const setBeatTimeout = newTimeout => {
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
    const receivedPong = () => {
        lastHeartbeatTime = Date.now();
    };

    const stop = () => {
        lastHeartbeatTime = undefined;
        clearInterval(timer);
        timer = undefined;
    };

    const isBeating = () => timer !== undefined;

    const start = sendPing => {
        if (!isFunction(sendPing))
            throw new TypeError(`${sendPing} must be a function.`);

        lastHeartbeatTime = Date.now();
        timer = setInterval(sendPing, 500);
    };

    return {
        getBeatInterval,
        setBeatInterval,
        getBeatTimeout,
        setBeatTimeout,
        hasTimedOut,
        getPing,
        setPing,
        getPong,
        receivedPong,
        setPong,
        stop,
        start,
        isBeating,
        DEFAULT
    };
};

module.exports = heartBeatFactory;
