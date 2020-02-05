import * as yargs from 'yargs';
import * as types from '../types';
import { YargsAdapter } from './yargs-adapter.class';
import { YargsBuilderImpl, defaultFailHandler, defaultOptionHandler } from './yargs-builder.impl';

export function dummy () {
  console.log('dummy: [yargs]');
}

export class YargsBuilder {

  constructor (private instance: yargs.Argv,
    private schema: types.IAeYargsSchema,
    private handler: types.IDefaultAeYargsOptionHandler | null = null,
    private adapter: types.IYargsAdapter = new YargsAdapter(schema),
    private impl: YargsBuilderImpl = new YargsBuilderImpl(handler, schema),
    private fail: (msg: string, err: Error, inst: yargs.Argv, ac: any) => yargs.Argv = defaultFailHandler) { }

  public buildCommand (command: any): yargs.Argv {
    const adaptedCommand = this.adapter.adapt(command);
    return this.impl.buildCommand(this.instance, adaptedCommand, this.fail);
  }
} // YargsBuilder
