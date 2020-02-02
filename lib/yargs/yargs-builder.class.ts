import * as yargs from 'yargs';
import * as types from '../types';
import { YargsAdapter } from './yargs-adapter.class';
import { YargsBuilderImpl } from './yargs-builder.impl';

export function dummy () {
  console.log('dummy: [yargs]');
}

export class YargsBuilder {

  constructor (private instance: yargs.Argv,
    private handler: types.IAeYargsOptionHandler | null,
    private exclusions: string[] = [],
    private adapter: types.IYargsAdapter = new YargsAdapter(exclusions),
    private impl: YargsBuilderImpl = new YargsBuilderImpl(handler),
    private fail: (msg: string, err: Error, inst: yargs.Argv, ac: any) => yargs.Argv
    ) {

  }

  public buildCommand (command: any): yargs.Argv {

    const adaptedCommand = this.adapter.adapt(command);
    return this.impl.buildCommand(this.instance, adaptedCommand, this.fail);
  }
}
