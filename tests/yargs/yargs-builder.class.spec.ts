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
      const builder: build.YargsBuilder = new build.YargsBuilder(
        instance,
        aeSchema,
        defaultHandlers
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
        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          aeSchema,
          defaultHandlers
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
          aeSchema
        );
        expect(builder).not.to.be.undefined();
      });
    });

    context('given: builder using client specified handlers', () => {
      it('should: create yargs builder', () => {
        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          aeSchema,
          defaultHandlers
        );
        expect(builder).not.to.be.undefined();
      });
    });

    context('given: builder using non default option handler', () => {
      it('should: create yargs builder', () => {
        const handler = (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
          positional: boolean,
          callback: types.IDefaultAeYargsOptionCallback): yargs.Argv => {
          return callback(yin, optionName, optionDef, positional);
        };

        const handlers: types.IAeYargsBuildHandlers = {
          onOption: handler
        };

        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          aeSchema,
          handlers
        );
        expect(builder).not.to.be.undefined();
      });
    }); // given: builder using non default option handler

    context('given: builder using non default before command handler', () => {
      it('should: create yargs builder', () => {
        function handler (yin: yargs.Argv, commandDescription: string,
          helpDescription: string, adaptedCommand: { [key: string]: any })
          : yargs.Argv {
          return yin;
        }
        const handlers: types.IAeYargsBuildHandlers = {
          onBeforeCommand: handler
        };

        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          aeSchema,
          handlers
        );
        expect(builder).not.to.be.undefined();
      });
    }); // given: builder using non default before command handler

    context('given: builder using non default after command handler', () => {
      it('should: create yargs builder', () => {
        function handler (yin: yargs.Argv)
          : yargs.Argv {
          return yin;
        }
        const handlers: types.IAeYargsBuildHandlers = {
          onAfterCommand: handler
        };

        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          aeSchema,
          handlers
        );
        expect(builder).not.to.be.undefined();
      });
    }); // given: builder using non default after command handler

    context('given: builder using non default fail handler', () => {
      it('should: create yargs builder', () => {
        function handler (msg: string, err: Error, yin: yargs.Argv, ac: any)
          : yargs.Argv {
          return yin;
        }
        const handlers: types.IAeYargsBuildHandlers = {
          onFail: handler
        };

        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          aeSchema,
          handlers
        );
        expect(builder).not.to.be.undefined();
      });
    }); // given: builder using non default fail handler

    context('given: builder using non default adapter', () => {
      it('should: create yargs builder', () => {
        const adapter = new YargsAdapter(aeSchema);
        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          aeSchema,
          defaultHandlers,
          adapter
        );
        expect(builder).not.to.be.undefined();
      });
    }); // given: builder using non adapter

    context('given: builder using non default impl', () => {
      it('should: create yargs builder', () => {
        const adapter = new YargsAdapter(aeSchema);
        const myImpl = new YargsBuilderImpl(aeSchema, defaultHandlers);
        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          aeSchema,
          defaultHandlers,
          adapter,
          myImpl
        );
        expect(builder).not.to.be.undefined();
      });
    }); // given: builder using non default impl
  }); // YargsBuilder constructor defaults
}); // YargsBuilder
