"use strict";

const isFunction = require("lodash.isfunction");

/**
 *  @public
 *  @author Pedro Miguel P. S. Martins
 *  @version 1.0.0
 *  @module heartBeat
 *  @desc   Runs a given ping function periodically and watches for timeouts.
 */
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
    
    /**
     *  @public 
     *  @func       hasTimedOut
     *  @returns    {Boolean}   <code>true</code> if the heartbeat has timedout, 
     *                          <code>false</code> otherwise. 
     * 
     *  @description    Used to detected if a heartbeat has timedout. A 
     *                  heartbeat times out when it sends a ping, and receives 
     *                  no pong after a given period of time. The timeout period
     *                  can be manipulated via <code>setBeatTimeout</code>.
     * @see             <code>setBeatTimeout</code>
     */
    const hasTimedOut = () =>
        Date.now() - lastHeartbeatTime > timeout;
    
    /**
     *  @public 
     *  @func       getBeatInterval
     *  @returns    {Number}        The current heartbeat interval.
     * 
     *  @description    Returns the current hearbeat interval. The heartbeat 
     *                  interval is the interval at which the heartbeat will run
     *                  the <code>ping</code> function.
     */
    const getBeatInterval = () => interval;
    
    /**
     *  @public 
     *  @func   setBeatInterval
     *  @param  {Number}        newInterval The new heartbeat interval.  
     * 
     *  @description    Sets the current heartbeat interval to the given one. 
     *                  Note that setting the heartbeat interval will <b>not</b>
     *                  affetct current heartbeat running. You must 
     *                  <code>stop</code> them and then <code>start</code> them
     *                  for the new interval to be applied.
     * @see             <code>stop</code>
     * @see             <code>start</code>
     */
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
