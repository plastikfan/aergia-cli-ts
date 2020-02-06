
import * as yargs from 'yargs';

// Yargs stuff
//
export interface IYargsAdapter {
  adapt (command: any): any;
}

/**
 * @description Yargs fail handler
 *
 * @export
 * @interface IFailHandler
 */
export interface IFailHandler {
  (msg: string, err: Error, inst: yargs.Argv, command: any): yargs.Argv;
}

/**
 * @description The handler that the user passes into the builder. One of it's parameters is a
 * callback that the builder provides. The client should call this default callback in addition
 * to performing custom functionality.
 *
 * @export
 * @interface IDefaultAeYargsOptionHandler
 */
export interface IDefaultAeYargsOptionHandler {
  (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
    positional: boolean,
    callback: IAeYargsOptionCallback): yargs.Argv;
}

/**
 * @description Represents the default handling of command options. Basically the same as
 * IDefaultAeYargsOptionHandler except for callback parameter, which of course is not required.
 *
 * @export
 * @interface IAeYargsOptionCallback
 */
export interface IAeYargsOptionCallback {
  (yin: yargs.Argv,
    optionName: string,
    optionDef: { [key: string]: any },
    positional: boolean): yargs.Argv;
}

/**
 * @description The handler that the user passes into the builder. One of it's parameters is a
 * callback that the builder provides. The client should call this default callback in addition
 * to performing custom functionality.
 *
 * @export
 * @interface IAeYargsCommandHandler
 */
export interface IAeYargsCommandHandler {
  (yin: yargs.Argv, commandName: string, commandDef: { [key: string]: any },
    callback: IDefaultAeYargsCommandCallback): yargs.Argv;
}

/**
 * @description Represents the default handling of commands. Basically the same as
 * IAeYargsCommandHandler except for callback parameter, which of course is not required.
 *
 * @export
 * @interface IDefaultAeYargsCommandCallback
 */
export interface IDefaultAeYargsCommandCallback {
  (yin: yargs.Argv,
    commandName: string,
    commandDef: { [key: string]: any }): yargs.Argv;
}

/**
 * @description Collection of handler functions
 *
 * @export
 * @interface IAeYargsBuildHandlers
 */
export interface IAeYargsBuildHandlers {
  option: IDefaultAeYargsOptionHandler;
  command: IAeYargsCommandHandler;
  fail: IFailHandler;
}

/**
 * @description Schema to provide a description of the cli being built
 *
 * @export
 * @interface IAeYargsSchema
 */
export interface IAeYargsSchema {
  labels: {
    commandNameId: string,
    commandOptions: string
    descendants: string,
    elements: string,
    validationGroups: string
  };
  exclusions: {
    options: string[];
  };
}
