
import * as yargs from 'yargs';

// Yargs stuff
//
export interface IYargsAdapter {
  adapt (command: any): any;
}

export interface IAeYargsOptionHandler {
  (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
    defaultHandler: IAeYargsOptionHandler,
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
