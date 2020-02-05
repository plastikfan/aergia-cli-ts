
import * as yargs from 'yargs';

// Yargs stuff
//
export interface IYargsAdapter {
  adapt (command: any): any;
}

/**
 *
 *
 * @export
 * @interface IDefaultAeYargsOptionHandler
 */
export interface IDefaultAeYargsOptionHandler {
  (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
    positional: boolean,
    callback: IAeYargsOptionCallback)
    : yargs.Argv;
}

/**
 *
 *
 * @export
 * @interface IAeYargsOptionCallback
 */
export interface IAeYargsOptionCallback {
  (yin: yargs.Argv,
    optionName: string,
    optionDef: { [key: string]: any },
    positional: boolean)
    : yargs.Argv;
}

export interface IAeYargsSchema {
  labels: {
    commandName: string,
    commandOptions: string
    descendants: string,
    elements: string,
    validationGroups: string
  };
  exclusions: string[];
}
