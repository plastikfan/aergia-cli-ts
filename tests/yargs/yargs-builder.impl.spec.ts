import { functify } from 'jinxed';
import { expect, assert, use } from 'chai';
import dirtyChai = require('dirty-chai');
use(dirtyChai);
import * as yargs from 'yargs';
import * as R from 'ramda';
import * as types from '../../lib/types';

import { YargsBuilderImpl } from '../../lib/yargs/yargs-builder.impl';

const aeSchema: types.IAeYargsSchema = {
  labels: {
    commandName: 'name',
    commandOptions: 'Arguments',
    descendants: '_children',
    elements: '_',
    validationGroups: 'ArgumentGroups'
  },
  exclusions: ['name', '_']
};

function defaultFailHandler (msg: string, err: Error, yin: yargs.Argv, ac: any)
  : yargs.Argv {
  console.log(`*** defaultFailHandler ===> FAIL: ${msg}`);
  return yin;
}

function defaultYargsFailHandler (msg: string, err: Error, yin: yargs.Argv)
  : yargs.Argv {
  console.log(`defaultYargsFailHandler -> FAIL: ${msg}`);
  return yin;
}

describe('YargsBuilderImpl without custom option handler', () => {
  const handler: null = null;
  let builderImpl: YargsBuilderImpl;
  let instance: yargs.Argv = require('yargs');

  beforeEach(() => {
    builderImpl = new YargsBuilderImpl(handler, aeSchema);
  });

  context('Arguments only', () => {
    context('Without any positional arguments', () => {
      context('given: a command a single argument', () => {
        it('should: build command with single parsed argument', () => {
          const command = {
            name: 'copy',
            describe: 'Copy file',
            _children: [
              {
                _: 'Arguments',
                _children: {
                  to: {
                    name: 'to',
                    alias: 't',
                    describe: 'destination file location',
                    _: 'Argument'
                  }
                }
              }
            ]
          };
          const yin = builderImpl.buildCommand(instance, command, defaultYargsFailHandler);
          const result = yin.parse(['copy', '-t ~/destination/front.jpg']);

          expect((result.t as string).trim()).to.equal('~/destination/front.jpg');
          expect((result.to as string).trim()).to.equal('~/destination/front.jpg');
        });
      });
    });

    context('With positional arguments', () => {
      context('given: a command a single argument', () => {
        it('should: build command with single parsed argument', () => {
          const command = {
            name: 'copy',
            describe: 'Copy file',
            positional: 'from',
            _children: [
              {
                _: 'Arguments',
                _children: {
                  to: {
                    name: 'to',
                    alias: 't',
                    describe: 'destination file location',
                    demandOption: true
                  },
                  from: {
                    name: 'from',
                    alias: 'f',
                    describe: 'source file location'
                  }
                }
              }
            ]
          };
          const yin = builderImpl.buildCommand(instance, command, defaultYargsFailHandler);
          const result = yin.parse(['copy', '-t ~/destination/front.jpg']);

          // expect((result.f as string).trim()).to.equal('~/source/front.jpg');
          // expect((result.from as string).trim()).to.equal('~/source/front.jpg');
        });
      });
    });
  });

  context('Arguments and ArgumentGroups', () => {
    //
  });
});
