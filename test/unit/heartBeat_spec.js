"use strict";

const chai = require("chai");
const sinon = require("sinon");
const expect = chai.expect;
const heartBeatFactory = require("../../src/heartbeat.js");

describe("heartBeat", () => {

    const PING = Buffer.from([0x01]);
    const PONG = Buffer.from([0x02]);
    const heartBeat = heartBeatFactory(PING, PONG);

    it("should get ping", () => {
        expect(heartBeat.getPing()).to.eql(PING);
    });
    it("should set ping", () => {
        const newPing = Buffer.from([0x03]);
        heartBeat.setPing(newPing);
        expect(heartBeat.getPing()).to.eql(newPing);
    });

    it("should get pong", () => {
        expect(heartBeat.getPong()).to.eql(PONG);
    });
    it("should set pong", () => {
        const newPong = Buffer.from([0x04]);
        heartBeat.setPong(newPong);
        expect(heartBeat.getPong()).to.eql(newPong);
    });

    it("should get interval", () => {
        expect(heartBeat.getBeatInterval()).to.eql(heartBeat.DEFAULT.INTERVAL);
    });
    it("should set interval", () => {
        const newInterval = 500;
        heartBeat.setBeatInterval(newInterval);
        expect(heartBeat.getBeatInterval()).to.eql(newInterval);
    });

    it("should get timeout", () => {
        expect(heartBeat.getBeatTimeout()).to.eql(heartBeat.DEFAULT.TIMEOUT);
    });
    it("should set timeout", () => {
        const newTimeout = 3000;
        heartBeat.setBeatTimeout(newTimeout);
        expect(heartBeat.getBeatTimeout()).to.eql(newTimeout);
    });

    it("should not be beating before being started", () => {
        expect(heartBeat.isBeating()).to.be.false;
    });

    it("should throw if 'pingFn' is not a function", () => {
        expect(heartBeat.start.bind(undefined, "Hello World")).to.throw(TypeError);
    });

    it("should call the 'pingFn' on every interval after it starts", done => {
        const spy = sinon.spy();
        heartBeat.start(spy);

        setTimeout(() => {
            expect(spy.calledTwice).to.be.true;
            heartBeat.stop();
            done();
        }, 1050);
    });

    it("should stop calling 'pingFn' when it stops", done => {
        const spy = sinon.spy();
        heartBeat.start(spy);

        setTimeout(() => {
            heartBeat.stop();
        }, 600);

        setTimeout(() => {
            expect(spy.calledOnce).to.be.true;
            done();
        }, 1100);
    });

    it("should be beating after it is started", done => {
        heartBeat.start(sinon.spy());
        setTimeout(() => {
            expect(heartBeat.isBeating()).to.be.true;
            heartBeat.stop();
            done();
        }, 0);


    });

    it("should not be beating after being stoppedd", done => {
        heartBeat.start(sinon.spy());
        setTimeout(() => {
            heartBeat.stop();
            expect(heartBeat.isBeating()).to.be.false;
            done();
        }, 0);
    });

    it("should timeout when it doesn't receive a pong withing 'timeout'", done => {
        heartBeat.setBeatTimeout(50);
        heartBeat.start(sinon.spy());
        
        setTimeout(() => {
            expect(heartBeat.hasTimedOut()).to.be.true;
            heartBeat.stop();
            done();
        }, 100);
    });
    
    it("should not time timeout if it recieves pongs", done => {
        heartBeat.setBeatTimeout(100);
        heartBeat.start(sinon.spy());
        
        setTimeout(() => {
            heartBeat.receivedPong();
            expect(heartBeat.hasTimedOut()).to.be.false;
            heartBeat.stop();
            done();
        }, 50);
        
    });
});
