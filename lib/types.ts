
import * as yargs from 'yargs';

// Yargs stuff
//
export interface IYargsAdapter {
  adapt (command: any): any;
}

export interface IAeYargsOptionHandler {
  (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
    positional: boolean,
    defaultHandler?: IAeYargsOptionHandler)
  : yargs.Argv;
}

export interface IDefaultAeYargsOptionHandler { // Client passes this into ctor
  (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
    positional: boolean,
    callback: IAeYargsOptionCallback)
    : yargs.Argv;
}

export interface IAeYargsOptionCallback { // Client passes this to YB
  (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
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
