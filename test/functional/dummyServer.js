const net = require("net");
const sinon = require("sinon");

const dummyServer = function(config) {

    const {
        port,
        host
    } = config;
    let server, sockets = [];

    const start = () => new Promise((resolve, reject) => {
        server = net.createServer(onConnSpy);
        server.once("error", err => reject(err));
        server.listen(port, host, () => resolve());
    });


    const onDataSpy = sinon.spy();
    const onConnSpy = sinon.spy(aSocket => {
        sockets.push(aSocket);
        aSocket.on("data", onDataSpy);
    });

    const stop = () => new Promise(resolve => {
        sockets.forEach(socket => socket.destroy());
        sockets  = [];
        server.close(() => resolve());
    });

    const send = data => new Promise(resolve => {
        sockets[0].write(data, "UTF8", resolve);
    });

    return {
        start,
        stop,
        onDataSpy,
        onConnSpy,
        send
    };
};

module.exports = dummyServer;
