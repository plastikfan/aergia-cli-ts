import { use, expect } from 'chai';
import dirtyChai = require('dirty-chai');
use(dirtyChai);
import * as yargs from 'yargs';
import * as build from '../../lib/yargs/yargs-builder.class';
import * as types from '../../lib/types';
import { YargsAdapter } from '../../lib/yargs/yargs-adapter.class';
import { YargsBuilderImpl, defaultHandlers } from '../../lib/yargs/yargs-builder.impl';

const aeSchema: types.IAeYargsSchema = {
  labels: {
    commandNameId: 'name',
    commandOptions: 'Arguments',
    descendants: '_children',
    elements: '_',
    validationGroups: 'ArgumentGroups'
  },
  exclusions: {
    options: ['name', '_']
  }
};

describe('YargsBuilder', () => {
  let instance: yargs.Argv;

  beforeEach(() => {
    instance = require('yargs');
  });

  context('given: command with positional and non positional options', () => {
    it('should: build command', () => {
      const handler = (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
        positional: boolean,
        callback: types.IDefaultAeYargsOptionCallback): yargs.Argv => {
        return callback(yin, optionName, optionDef, positional);
      };

      const builder: build.YargsBuilder = new build.YargsBuilder(
        instance,
        aeSchema,
        defaultHandlers,
        handler
      );

      const command = {
        name: 'copy',
        describe: 'Copy file',
        positional: 'from to',
        _children: [
          {
            _: 'Arguments',
            _children: {
              from: {
                name: 'from',
                describe: 'source file location',
                _: 'Argument'
              },
              to: {
                name: 'to',
                describe: 'destination file location',
                _: 'Argument'
              },
              log: {
                name: 'log',
                alias: 'l',
                describe: 'log file',
                _: 'Argument'
              },
              owner: {
                name: 'owner',
                alias: 'o',
                describe: 'set owner to',
                _: 'Argument'
              }
            }
          },
          {
            _: 'ArgumentGroups',
            _children: [
              {
                _: 'Implies',
                _children: [
                  { name: 'from', _: 'ArgumentRef' },
                  { name: 'to', _: 'ArgumentRef' }
                ]
              }
            ]
          }
        ]
      };

      const yin = builder.buildCommand(command);
      const result = yin.parse(['copy', '~/source/front.jpg',
        '~/destination/front.jpg', '--log', '~/logs/fs.log', '-o', '$(whoami)']);

      expect(result.from).to.equal('~/source/front.jpg');

      expect(result.to).to.equal('~/destination/front.jpg');

      expect(result.l).to.equal('~/logs/fs.log');
      expect(result.log).to.equal('~/logs/fs.log');

      expect(result.o).to.equal('$(whoami)');
      expect(result.owner).to.equal('$(whoami)');
    });
  });

  context('go', () => {
    context('given: a correctly defined command', () => {
      it('should: return the parsed command line', () => {
        const handler = null;
        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          aeSchema,
          defaultHandlers,
          handler
        );

        const command = {
          name: 'copy',
          describe: 'Copy file',
          _children: [
            {
              _: 'Arguments',
              _children: {
                from: {
                  name: 'from',
                  describe: 'source file location',
                  _: 'Argument'
                }
              }
            }
          ]
        };
        const yin = builder.buildCommand(command);
        const result = builder.go(yin);
        expect(result).to.not.be.undefined();
      });
    });
  }); // go

  describe('YargsBuilder constructor defaults', () => {
    context('given: builder using all defaults', () => {
      it('should: create yargs builder', () => {
        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          aeSchema,
          defaultHandlers
        );
        expect(builder).not.to.be.undefined();
      });
    });

    context('given: builder using non defaulted option handler', () => {
      it('should: create yargs builder', () => {
        const handler = (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
          positional: boolean,
          callback: types.IDefaultAeYargsOptionCallback): yargs.Argv => {
          return callback(yin, optionName, optionDef, positional);
        };

        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          aeSchema,
          defaultHandlers,
          handler
        );
        expect(builder).not.to.be.undefined();
      });
    }); // given: builder using non defaulted option handler

    context('given: builder using non default adapter', () => {
      it('should: create yargs builder', () => {
        const handler = (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
          positional: boolean,
          callback: types.IDefaultAeYargsOptionCallback): yargs.Argv => {
          return callback(yin, optionName, optionDef, positional);
        };

        const adapter = new YargsAdapter(aeSchema);
        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          aeSchema,
          defaultHandlers,
          handler,
          adapter
        );
        expect(builder).not.to.be.undefined();
      });
    }); // given: builder using non adapter

    context('given: builder using non default impl', () => {
      it('should: create yargs builder', () => {
        const handler = (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
          positional: boolean,
          callback: types.IDefaultAeYargsOptionCallback): yargs.Argv => {
          return callback(yin, optionName, optionDef, positional);
        };

        function optionHandler (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
          positional: boolean)
          : yargs.Argv {

          return positional
            ? yin.positional(optionName, optionDef)
            : yin.option(optionName, optionDef);
        }

        const adapter = new YargsAdapter(aeSchema);
        const impl = new YargsBuilderImpl(aeSchema, optionHandler, defaultHandlers);
        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          aeSchema,
          defaultHandlers,
          handler,
          adapter,
          impl
        );
        expect(builder).not.to.be.undefined();
      });
    }); // given: builder using non default impl

    context('given: builder using non default fail handler', () => {
      it('should: create yargs builder', () => {
        const handler = (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
          positional: boolean,
          callback: types.IDefaultAeYargsOptionCallback): yargs.Argv => {
          return callback(yin, optionName, optionDef, positional);
        };

        function optionHandler (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
          positional: boolean)
          : yargs.Argv {

          return positional
            ? yin.positional(optionName, optionDef)
            : yin.option(optionName, optionDef);
        }

        function failHandler (msg: string, err: Error, yin: yargs.Argv, ac: any)
          : yargs.Argv {
          return yin;
        }

        const adapter = new YargsAdapter(aeSchema);
        const impl = new YargsBuilderImpl(aeSchema, optionHandler, defaultHandlers);
        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          aeSchema,
          defaultHandlers,
          handler,
          adapter,
          impl,
          failHandler
        );
        expect(builder).not.to.be.undefined();
      });
    }); // given: builder using non default impl
  }); // YargsBuilder constructor defaults
}); // YargsBuilder
