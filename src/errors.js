/**
 *  @typedef    {Error}     ObjectNotWatched
 *  @augments   {Error}
 *  @property   {string}    name=ObjectNotWatched   Name of the error.
 *  @property   {string}    message                 Message of the error.
 *
 *  @description    Error thrown when one tries to perform an action on an
 *                  object that was not previously registered using
 *                  <code>watch</code>.
 *
 * @example
 *
 * const watcher = require("obj-watcher");
 *
 * watcher.unwatch("status"); //Throw, "status" is not watched.
 */

/**
 *  @typedef    {Error}     ObjectAlreadyWatched
 *  @property   {string}    name=ObjectAlreadyWatched   Name of the error.
 *  @property   {string}    message                     Message of the error.
 *
 *  @description    Error thrown when one tries to re-watch an object that was
 *                  already being watched. This means that you are trying to
 *                  watch an object and that the library already has something
 *                  with the given {Id}.
 *
 * @example
 *
 * const watcher = require("obj-watcher");
 *
 * watcher.watch("status", { online: true });
 * watcher.watch("status", { fruit: "banana" }); //Throws, key "status" is already under use.
 */

/**
 *  @typedef    {Error}     CallbackNotAFunction
 *  @property   {string}    name=CallbackNotAFunction   Name of the error.
 *  @property   {string}    message                     Message of the error.
 *
 *  @description    Error throw when one calls <code>onChange</code> passing a
 *                  callback parameter that is not a function.
 *
 * @example
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
 * @returns {Error}
 *
 * @description Creates an error and returns it. Only creates generic errors of
 *              type "Error".
 */
const errorFactory = (name, message, errorType = new Error()) => {
    const error = errorType;
    error.message = message + " See https://fl4m3ph03n1x.github.io/obj-watcher/global.html for more info on errors.";
    error.name = name;
    return error;
};

/**
 *  @private
 *  @func       callbackNotAFunction
 *  @param      {Id}            objId   Id of the object that caused the
 *                                          error.
 *  @returns    {Error}
 *
 *  @description    Creates a "CallbackNotAFunction" error for the object with
 *                  the given id and returns it. Used when a user passes an
 *                  object that is expected to be a function but isn't.
 */
const callbackNotAFunction = (callbackName, eventName) =>
    errorFactory("CallbackNotAFunction", `Provided callback ${callbackName} for event ${eventName} is not a function.`, new TypeError());

module.exports.callbackNotAFunction = callbackNotAFunction;
