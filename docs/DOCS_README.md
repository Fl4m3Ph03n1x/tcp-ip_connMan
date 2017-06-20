#   What

`tcp-ip_connMan` stands "tcp-ip Connection Manager". As the name says, it takes 
care of connections for you, with automatic reconnects, heartbeat and events, 
you don't need to worry if your connections are up or down, `tcp-ip_connMan`
will take care of that for you.

With `tcp-ip_connMan` all you need to do is to connect, and forget all your 
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

If you don't want to use the events API, that's fine as well, as `tcp-ip_connMan`
manages timeouts and connection drops automatically reconnecting for you. 

#   How

Following are instructions on how to intsall and use `tcp-ip_connMan`. For more 
information about the project you can check the GitHub page:

 - tcp-ip_connMan Github

And for questions you can ask in the issues page:

 - tcp-ip_connMan Issues

Feel free to check the project's project page for additional information on the 
API as well.

##  Install

npm install tcp-ip_connMan --save

##  Examples