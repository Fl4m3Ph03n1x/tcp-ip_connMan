"use strict";

const net = require( "net" );
const chai = require( "chai" );
const expect = chai.expect;
const sinon = require( "sinon" );
const connManager = require( "../src/connectionManager.js" );

describe( "connectionManager", () => {
    const dummyServer = function ( config ) {

        const {
            port,
            host
        } = config;
        let server, socket;

        const start = function () {
            return new Promise( ( resolve, reject ) => {

                server = net.createServer( onConnSpy );
                server.on( "error", err => reject( err ) );
                server.listen( port, host, () => resolve() );
            } );
        };

        const onDataSpy = sinon.spy();
        const onConnSpy = sinon.spy( aSocket => {
            socket = aSocket;
            socket.on( "data", onDataSpy );
        } );

        const stop = function () {
            return new Promise( resolve => {
                if ( socket !== undefined )
                    socket.destroy();
                server.close( () => resolve() );
            } );
        };

        const reset = () => stop().then( start );

        return {
            start,
            stop,
            reset,
            onDataSpy,
            onConnSpy
        };
    };

    const config = {
        host: "localhost",
        port: 8124
    };

    const client = Object.assign({}, connManager());
    const server = dummyServer( config );


    before( "start dummyServer", done => {
        server.start()
            .then( done )
            .catch( done );
    } );

    after( "stop dummyServer", done => {
        server.stop()
            .then( done )
            .catch( done );
    } );

    afterEach( "reset dummyServer", server.reset );

    it( "should connect to the server", done => {
        client.connect( config )
            .then( () => {
                expect( server.onConnSpy.called ).to.be.true;
                done();
            } )
            .catch( err => done( err ) );
    } );

    it( "should disconnect from the server", done => {
        const disconnectSpy = sinon.spy(client, "disconnect");

        //useless test. I should inject the dependencies connection and heartBeat
        client.connect( config )
            .then( client.disconnect )
            .then( () => {
                expect( disconnectSpy.calledOnce ).to.be.true;
                done();
            } )
            .catch( done );
    } );

    // it( "should try to reconnect if the server is offline upon startup", done => {
    //         client.connect()
    // } );
    
    // it( "should try to reconnect if it looses connection to the server temporarily", () => {} );
    //

    //
    // it( "should call 'onOpen' when a connection is created", () => {} );
    //
    // it( "should call 'onClose' when a connection is lost", () => {} );
    //
    // it( "should call 'onRetry' when it tries to connect", () => {} );
    //
    // it( "should call 'onRead' when it receives a message", () => {} );
    //
    // it( "should not call 'onRead' when it receives a pong", () => {} );
    //
    // it( "should send information to the server", () => {} );
    //
    // it( "should throw when asked to send information to a dead server", () => {} );
    //
    // it( "should use the provided connect function to connect", () => {} );
    //
    // it( "should send pings to the server", () => {} );
    //
    // it( "should send specific pings to the server", () => {} );
    //
    // it( "should receive pongs from the server", () => {} );
} );
