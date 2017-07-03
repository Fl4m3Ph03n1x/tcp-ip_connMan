/**
 *  @typedef    {TypeError} CallbackNotAFunction
 *  @property   {string}    name=CallbackNotAFunction   Name of the error.
 *  @property   {string}    message                     Message of the error.
 *
 *  @description    Error throw when one passes a <code>newFn</code> parameter
 *                  that is not a function to any of the following events:
 *                  <ul>
 *                      <li><code>onOpen</code></li>
 *                      <li><code>onClose</code></li>
 *                      <li><code>onRead</code></li>
 *                      <li><code>onRetry</code></li>
 *                  </ul>
 * @example
 *
 * const watcher = require("obj-watcher");
 *
 * watcher.watch("status", { online: true });
 * //Throws, second parameter should be of type "function".
 * watcher.onChange("status", "I am not a function!");
 */

 /**
  *  @typedef    {TypeError} ConnectHandlerNotAFunction
  *  @property   {string}    name=ConnectHandlerNotAFunction    Name of the error.
  *  @property   {string}    message                            Message of the error.
  *
  *  @description     Error throw when one tries to <code>setConnectFn</code>
  *                   with something that is not a function.
  *  @example
  *
  * const watcher = require("obj-watcher");
  *
  * watcher.watch("status", { online: true });
  * //Throws, second parameter should be of type "function".
  * watcher.onChange("status", "I am not a function!");
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
    error.message = message + " See https://fl4m3ph03n1x.github.io/obj-watcher/global.html for more info on errors.";
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
 *                  returned when one tries to setConnectFn with something that
 *                  is not a function.
 */
const connectHandlerNotAFunction = ( handler ) =>
    errorFactory( "ConnectHandlerNotAFunction", `Provided connect handler ${handler} for is not a function.`, new TypeError() );


module.exports.callbackNotAFunction = callbackNotAFunction;
module.exports.connectHandlerNotAFunction = connectHandlerNotAFunction;