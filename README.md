<div align="center">
    <a href="https://fl4m3ph03n1x.github.io/tcp-ip_connMan/index.html">
        <img src="./logos/logo_no_wm.png">
    </a>
</div>

<div align="center">

[![NPM](https://nodei.co/npm/tcp-ip-connman.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/tcp-ip-connman/)

[![Build Status](https://travis-ci.org/Fl4m3Ph03n1x/tcp-ip_connMan.svg?branch=master)](https://travis-ci.org/Fl4m3Ph03n1x/tcp-ip_connMan)
[![codecov](https://codecov.io/gh/Fl4m3Ph03n1x/tcp-ip_connMan/branch/master/graph/badge.svg)](https://codecov.io/gh/Fl4m3Ph03n1x/tcp-ip_connMan)
[![Dependency Status](https://david-dm.org/Fl4m3Ph03n1x/tcp-ip_connman.svg)](https://david-dm.org/Fl4m3Ph03n1x/tcp-ip_connman)
[![Code Climate](https://codeclimate.com/github/Fl4m3Ph03n1x/tcp-ip_connMan/badges/gpa.svg)](https://codeclimate.com/github/Fl4m3Ph03n1x/tcp-ip_connMan)
[![Known Vulnerabilities](https://snyk.io/test/github/fl4m3ph03n1x/tcp-ip_connman/badge.svg)](https://snyk.io/test/github/fl4m3ph03n1x/tcp-ip_connman)
[![Inline docs](http://inch-ci.org/github/Fl4m3Ph03n1x/tcp-ip_connMan.svg?branch=master)](http://inch-ci.org/github/Fl4m3Ph03n1x/tcp-ip_connMan)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/Fl4m3Ph03n1x/tcp-ip_connMan/issues)

</div>

#   What

`tcp-ip-connman` stands "tcp-ip Connection Manager". As the name says, it takes
care of connections for you, with automatic reconnects, heartbeat and events,
you don't need to worry if your connections are up or down, `tcp-ip-connman`
will take care of that for you.

With `tcp-ip-connman` all you need to do is to connect, and forget all your
problems!

#   Why

TCP/IP connections are tricky, mainly becasuse of [half-closed](https://superuser.com/a/615971/222770)
and [half-open](https://blog.stephencleary.com/2009/05/detection-of-half-open-dropped.html)
connections.

While Node.js does a decent job dealing with half-closed connections, we can't say
the same for half-open connections.

Basically, if the end of a connection dies, the other end will remain open, like
nothing happened.

This library takes care of half-open connections, by implementing a heartbeat and
by having a event rich API to let you know everything you need.

If you don't want to use the events API, that's fine as well, as `tcp-ip-connman`
manages timeouts and connection drops automatically reconnecting for you.

#   How

Following are instructions on how to intsall and use `tcp-ip-connman`. For
questions you can ask in the issues page:

 - [tcp-ip-connman Issues](https://github.com/Fl4m3Ph03n1x/tcp-ip_connMan/issues)

Feel free to check the [project's page](https://fl4m3ph03n1x.github.io/tcp-ip_connMan/index.html) for additional information on the
API as well.

##  Install

    npm install tcp-ip-connman --save

##  API

 - <a href="https://fl4m3ph03n1x.github.io/tcp-ip_connMan/module-connManager.html#~connect" target="_blank">connect</a>
 - <a href="https://fl4m3ph03n1x.github.io/tcp-ip_connMan/module-connManager.html#~disconnect" target="_blank">disconnect</a>
 - <a href="https://fl4m3ph03n1x.github.io/tcp-ip_connMan/module-connManager.html#~isConnected" target="_blank">isConnected</a>
 - <a href="https://fl4m3ph03n1x.github.io/tcp-ip_connMan/module-connManager.html#~send" target="_blank">send</a>
 - <a href="https://fl4m3ph03n1x.github.io/tcp-ip_connMan/module-connManager.html#~onClose" target="_blank">onClose</a>
 - <a href="https://fl4m3ph03n1x.github.io/tcp-ip_connMan/module-connManager.html#~onOpen" target="_blank">onOpen</a>
 - <a href="https://fl4m3ph03n1x.github.io/tcp-ip_connMan/module-connManager.html#~onRead" target="_blank">onRead</a>
 - <a href="https://fl4m3ph03n1x.github.io/tcp-ip_connMan/module-connManager.html#~onRetry" target="_blank">onRetry</a>
 - <a href="https://fl4m3ph03n1x.github.io/tcp-ip_connMan/module-connManager.html#~setConnectFn" target="_blank">setConnectFn</a>

##  Examples

Creating a connection manager with a custom heartbeat and connect:

    const connmanager = require("tcp-ip-connman");
    const heartBeat = heartBeatFactory();
    heartBeat.setPing("Marco");
    heartBeat.setPong("Polo");
    heartBeat.setBeatInterval(50);
    heartBeat.setBeatTimeout(150);

    const client = connmanager(heartBeat);

    client.connect({host: "localhost", port: 8080})
        .then(() => console.log("success!")
        .catch(console.log);

Creating a connection manager with a default PING, PONG and heartbeat:

    const connmanager = require("tcp-ip-connman");

    //Default PING is Buffer.from([0x01])
    //Default PONG is Buffer.from([0x02])
    //Default TIMEOUT and INTERVAL are from heartbeatjs (https://www.npmjs.com/package/heartbeatjs)
    const client = connmanager();

    client.connect({host: "localhost", port: 8080})
        .then(() => console.log("success!")
        .catch(console.log);

Using a previously created connman to define behaviors for the various
events:

    client.onOpen(online => {
        console.log(`Connection established: ${online}`);
    });

    client.onClose(online => {
        console.log(`Connection established: ${online}`);
    });

    client.onRead(data => {
        console.log(`Data received: ${JSON.stringify(data)}`);
    });

    client.onRetry((error, num) => {
        console.log(`Retry number ${num} due to error ${JSON.stringify(error)}`);
    });
