
import * as yargs from 'yargs';

// Yargs stuff
//
export interface IYargsAdapter {
  adapt (command: any): any;
}

// Labels; this is a temporary workaround
// (Eventually, this should be passed into aergia)
//
export const labels = {
  commandName: 'name',
  descendants: '_children',
  commandOptions: 'Arguments',
  elementLabel: '_',
  validationGroups: 'ArgumentGroups'
};

export interface IAeYargsOptionHandler {
  (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
    defaultHandler: IAeYargsOptionHandler,
    positional: boolean)
  : yargs.Argv;
}
