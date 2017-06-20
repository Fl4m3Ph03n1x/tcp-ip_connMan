"use strict";

const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const connManager = require("../../src/connectionManager.js");
const heartBeatFactory = require("heartbeatjs");
const dummyServerFactory = require("./dummyServer.js");
const net = require("net");


describe("connectionManager", () => {
    const config = {
        host: "localhost",
        port: 8124
    };

    const PING = Buffer.from([0x01]),
        PONG = Buffer.from([0x02]);

    const heartBeat = Object.assign({}, heartBeatFactory());
    heartBeat.setPing(PING);
    heartBeat.setPong(PONG);
    heartBeat.setBeatInterval(50);

    const client = Object.assign({}, connManager(heartBeat));
    const server = dummyServerFactory(config);


    beforeEach("start server", done => {
        server.start()
            .then(done)
            .catch(done);
    });

    afterEach("stop server, disconnect client", done => {
        client.disconnect();
        server.stop()
            .then(done)
            .catch(done);
    });
    
    it("should connect to the server", done => {
        client.connect(config)
            .then(() => {
                expect(server.onConnSpy.called).to.be.true;
                done();
            })
            .catch(err => done(err));
    });

    it("should throw error if no options argument is passed to connect", done => {
        client.connect()
            .then(() => done("expected client.connect to be rejected, but it was resolved."))
            .catch(() => done());
    });

    it("should stop pinging if it is disconnected from the server", done => {
        client.connect(config)
            .then(client.disconnect)
            .then(() => {
                expect(heartBeat.isBeating()).to.be.false;
                done();
            })
            .catch(done);
    });

    it("should try to reconnect if the server is offline upon startup", done => {
        const retrySpy = sinon.spy();
        client.onRetry(retrySpy);

        server.stop()
            .then(() => {
                client.connect(config);
            });

        setTimeout(() => {
            expect(retrySpy.called).to.be.true;
            done();
        }, 50);
    });

    it("should reconnect if it looses connection to the server temporarily", done => {
        client.connect(config);

        setTimeout(() => {
            server.stop()
                .then(client.connect.bind(null, config));
        }, 75);

        setTimeout(() => {
            server.start()
                .catch(done);
        }, 125);

        setTimeout(() => {
            expect(client.isConnected()).to.be.true;
            done();
        }, 150);
    });

    it("should throw if onOpen is not a function", () => {
        expect(client.onOpen.bind(null, "notAFunction")).to.throw(TypeError);
    });

    it("should throw if onClose is not a function", () => {
        expect(client.onClose.bind(null, "notAFunction")).to.throw(TypeError);
    });

    it("should throw if onRead is not a function", () => {
        expect(client.onRead.bind(null, "notAFunction")).to.throw(TypeError);
    });

    it("should throw if onRetry is not a function", () => {
        expect(client.onRetry.bind(null, "notAFunction")).to.throw(TypeError);
    });

    it("should throw if connectFn is not a function", () => {
        expect(client.setConnectFn.bind(null, "notAFunction")).to.throw(TypeError);
    });

    it("should call 'onOpen' when a connection is created", done => {
        const openSpy = sinon.spy();
        client.onOpen(openSpy);
        client.connect(config)
            .then(() => {
                //avoid race condition
                setTimeout(() => {
                    expect(openSpy.called).to.be.true;
                    done();
                }, 100);
            })
            .catch(done);
    });

    it("should call 'onClose' when a connection is lost", done => {
        const closeSpy = sinon.spy();
        client.onClose(closeSpy);
        client.connect(config)
            .then(client.disconnect)
            .then(() => {
                expect(closeSpy.calledOnce).to.be.true;
                done();
            })
            .catch(done);
    });

    it("should call 'onRetry' when it tries to reconnect", done => {
        const retrySpy = sinon.spy();
        client.onRetry(retrySpy);
        client.connect(config);

        setTimeout(() => {
            server.stop()
                .then(client.connect.bind(null, config));
        }, 50);

        setTimeout(() => {
            expect(retrySpy.called).to.be.true;
            done();
        }, 100);
    });

    it("should call 'onRead' when it receives a message", done => {
        const data = Buffer.from("Hello World");

        const readStub = sinon.stub().callsFake(receivedData => {
            expect(receivedData).to.eql(data);
            done();
        });
        client.onRead(readStub);

        client.connect(config)
            .then(() => server.send(data))
            .catch(done);
    });

    it("should not call 'onRead' when it receives a pong", done => {

        const readStub = sinon.stub().callsFake(() => {
            done("onRead was called and should not have been called.");
        });
        client.onRead(readStub);

        client.connect(config)
            .then(() => server.send(PONG))
            .catch(done);

        setTimeout(done, 100);
    });

    it("should send information to the server", done => {
        const data = Buffer.from("Hello World");
        client.connect(config)
            .then(() => client.send(data));

        setTimeout(() => {
            expect(server.onDataSpy.calledWith(data)).to.be.true;
            done();
        }, 10);

    });

    it("should throw when asked to send information to a dead server", () => {
        server.stop()
            .then(() => {
                expect(client.send.bind(null, PING)).to.throw(Error);
            });
    });

    it("should have state disconnected when it is disconnected from the server", done => {
        server.stop()
            .then(() => {
                expect(client.isConnected()).to.be.false;
                done();
            })
            .catch(done);
    });

    it("should have state connected when it is connected to server", done => {
        client.connect(config)
            .then(() => {
                expect(client.isConnected()).to.be.true;
                done();
            })
            .catch(done);
    });

    it("should be able to connect with a custom function", done => {

        const customConnect = theOpts => new Promise((resolve, reject) => {
            const socket = net.createConnection(theOpts, () => resolve(socket));
            socket.once("error", err => reject(err));
        });

        client.setConnectFn(customConnect);
        client.connect(config)
            .then(() => {
                expect(client.isConnected()).to.be.true;
                done();
            })
            .catch(done);
    });

    it("should disconnect if it timesout", done => {
        const closeSpy = sinon.spy();
        client.onClose(closeSpy);

        heartBeat.setBeatTimeout(20);
        client.connect(config)
            .catch(done);

        setTimeout(() => {
            expect(closeSpy.called).to.be.true;
            done();
        }, 100);
    });

    it("should disconnect if it fails to send a ping", done => {

        sinon.stub(heartBeat, "getPing").throws();

        const closeSpy = sinon.spy();
        client.onClose(closeSpy);

        heartBeat.setBeatTimeout(1000);
        client.connect(config)
            .catch(done);

        setTimeout(() => {
            expect(closeSpy.called).to.be.true;
            heartBeat.getPing.restore();
            done();
        }, 100);
    });
    
    it("should attempt to reconnect when it timesout", done => {
        
        heartBeat.setBeatTimeout(1);
        client.connect(config)
            .then(() => {
                
                const openSpy = sinon.spy();
                client.onOpen(openSpy);
                setTimeout(() => {
                    expect(openSpy.called).to.be.true; 
                    done();
                }, 50);
            })
            .catch(done);
    });
    
    it("should connect with no heartBeat provided", done => {
        const defaultClient = connManager();
        const openSpy = sinon.spy();
        defaultClient.onOpen(openSpy);
        
        defaultClient.connect(config)
            .then(() => {
                //avoid race condition
                setTimeout(() => {
                    expect(openSpy.called).to.be.true;
                    done();
                }, 100);
            })
            .catch(done);
    });
    
});
