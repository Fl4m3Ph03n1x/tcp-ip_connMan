/**
 *  @typedef    {TypeError} CallbackNotAFunction
 *  @property   {string}    name=CallbackNotAFunction   Name of the error.
 *  @property   {string}    message                     Message of the error.
 *
 *  @description    Error throw when one passes a <code>newFn</code> parameter
 *                  that is not a function to any of the following events:
 *                  <ul>
 *                      <li><a href="https://fl4m3ph03n1x.github.io/tcp-ip_connMan/module-connManager.html#~onOpen">onOpen</a></li>
 *                      <li><a href="https://fl4m3ph03n1x.github.io/tcp-ip_connMan/module-connManager.html#~onClose">onClose</a></li>
 *                      <li><a href="https://fl4m3ph03n1x.github.io/tcp-ip_connMan/module-connManager.html#~onRead">onRead</a></li>
 *                      <li><a href="https://fl4m3ph03n1x.github.io/tcp-ip_connMan/module-connManager.html#~onRetry">onRetry</a></li>
 *                  </ul>
 *  @example
 *
 * const connmanager = require("tcp-ip-connman");
 * const client = connmanager();
 * client.onRead("I am not a function!"); //error
 */

/**
 *  @typedef    {TypeError} ConnectHandlerNotAFunction
 *  @property   {string}    name=ConnectHandlerNotAFunction    Name of the error.
 *  @property   {string}    message                            Message of the error.
 *
 *  @description     Error throw when one tries use <a href="https://fl4m3ph03n1x.github.io/tcp-ip_connMan/module-connManager.html#~setConnectFn">setConnectFn</a>
 *                   with a parameter that is not a function.
 *  @example
 *
 *  const connmanager = require("tcp-ip-connman");
 *  const client = connmanager();
 *  client.setConnectFn("I am not a function!"); //error
 */

/**
 *  @typedef    {Error}    ConnectionDown
 *  @property   {string}   name=ConnectionDown Name of the error.
 *  @property   {string}   message             Message of the error.
 *
 *  @description     Error throw when one tries to use <code>send</code>
 *                   and the socket used in the connection is destroyed,
 *                   meaning that there is no valid connection up.
 *  @example
 *
 *  const connmanager = require("tcp-ip-connman");
 *  const client = connmanager();
 *  console.log(isConnected()); //false!
 *
 *  //error, there is no connection or the connection is down
 *  client.send("I didn't connect b4!");
 */

 /**
  *  @typedef    {Error}    OptionsNotProvided
  *  @property   {string}   name=OptionsNotProvided Name of the error.
  *  @property   {string}   message                 Message of the error.
  *
  *  @description     Error throw when one tries to use <a href="https://fl4m3ph03n1x.github.io/tcp-ip_connMan/module-connManager.html#~connect">connect</a>
  *                   without passing an options parameter.
  *  @example
  *
  *  const connmanager = require("tcp-ip-connman");
  *  const client = connmanager();
  *  client.connect(); //error, a parameter is necessary
  */

/**
 * @private
 * @func    errorFactory
 * @param   {string}        name    The name of the error to be created.
 * @param   {string}        message The message the error will contain.
 * @param   {Error}         [errorType = new Error()] The error type that will
 *                                                    be created and returned.
 * @returns {Error}
 *
 * @description Creates an error and returns it.
 */
const errorFactory = ( name, message, errorType = new Error() ) => {
    const error = errorType;
    error.message = message + ` See https://fl4m3ph03n1x.github.io/tcp-ip_connMan/global.html#${name} for more info on errors.`;
    error.name = name;
    return error;
};

/**
 *  @private
 *  @func       callbackNotAFunction
 *  @param      {function}    callbackFn  The object causing the error.
 *  @param      {string}      eventName   Name of the event where the error is
 *                                        occuring.
 *  @returns    {TypeError}
 *
 *  @description    Creates a "CallbackNotAFunction" TypeError for the event
 *                  that received the wrong parameter and returns it. Used when
 *                  a user passes an object that is expected to be a function
 *                  but isn't.
 */
const callbackNotAFunction = ( callbackFn, eventName ) =>
    errorFactory( "CallbackNotAFunction", `Provided callback ${callbackFn} for event ${eventName} is not a function.`, new TypeError() );

/**
 *  @private
 *  @func       connectHandlerNotAFunction
 *  @param      {function}  handler The object causing the error.
 *  @returns    {TypeError}
 *
 *  @description    Creates a "ConnectHandlerNotAFunction" TypeError that is
 *                  returned when one calls <code>setConnectFn</code> with
 *                  something that is not a function.
 */
const connectHandlerNotAFunction = ( handler ) =>
    errorFactory( "ConnectHandlerNotAFunction", `Provided connect handler ${handler} for is not a function.`, new TypeError() );

/**
 *  @private
 *  @func       connectionDown
 *  @returns    {Error}
 *
 *  @description    Creates a "ConnectionDown" Error that is
 *                  returned when one calls <code>send</code> a message without
 *                  being connected.
 */
const connectionDown = () =>
    errorFactory( "ConnectionDown", "Connection is down, message not delivered." );

/**
 *  @private
 *  @func       optionsNotProvided
 *  @returns    {Error}
 *
 *  @description    Creates a "OptionsNotProvided" Error that is
 *                  returned when one invokes <code>connect</code> without
 *                  providing an options parameter.
 */
const optionsNotProvided = () =>
    errorFactory( "OptionsNotProvided", "'connect' must have options." );


module.exports.callbackNotAFunction = callbackNotAFunction;
module.exports.connectHandlerNotAFunction = connectHandlerNotAFunction;
module.exports.connectionDown = connectionDown;
module.exports.optionsNotProvided = optionsNotProvided;
