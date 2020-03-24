import { use, expect } from 'chai';
import * as xiberia from '../../lib/xiberia.local';
import * as yargs from 'yargs';
import * as build from '../../lib/yargs/yargs-builder.class';
import { YargsAdapter } from '../../lib/yargs/yargs-adapter.class';
import { YargsBuilderImpl, defaultHandlers } from '../../lib/yargs/yargs-builder.impl';
import dirtyChai = require('dirty-chai');
use(dirtyChai);

const conversionSchema: xiberia.IJsonConversionSchema = {
  labels: {
    commandNameId: 'name',
    commandOptions: 'Arguments',
    descendants: '_children',
    elements: '_',
    validationGroups: 'ArgumentGroups'
  },
  paths: {
    collective: 'commands'
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
        conversionSchema,
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
          conversionSchema,
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
          conversionSchema
        );
        expect(builder).not.to.be.undefined();
      });
    });

    context('given: builder using client specified handlers', () => {
      it('should: create yargs builder', () => {
        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          conversionSchema,
          defaultHandlers
        );
        expect(builder).not.to.be.undefined();
      });
    });

    context('given: builder using non default option handler', () => {
      it('should: create yargs builder', () => {
        const handler = (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
          positional: boolean,
          callback: xiberia.IDefaultYargsOptionCallback): yargs.Argv => {
          return callback(yin, optionName, optionDef, positional);
        };

        const handlers: xiberia.IYargsBuildHandlers = {
          onOption: handler
        };

        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          conversionSchema,
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
        const handlers: xiberia.IYargsBuildHandlers = {
          onBeforeCommand: handler
        };

        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          conversionSchema,
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
        const handlers: xiberia.IYargsBuildHandlers = {
          onAfterCommand: handler
        };

        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          conversionSchema,
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
        const handlers: xiberia.IYargsBuildHandlers = {
          onFail: handler
        };

        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          conversionSchema,
          handlers
        );
        expect(builder).not.to.be.undefined();
      });
    }); // given: builder using non default fail handler

    context('given: builder using non default adapter', () => {
      it('should: create yargs builder', () => {
        const adapter = new YargsAdapter(conversionSchema);
        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          conversionSchema,
          defaultHandlers,
          adapter
        );
        expect(builder).not.to.be.undefined();
      });
    }); // given: builder using non adapter

    context('given: builder using non default impl', () => {
      it('should: create yargs builder', () => {
        const adapter = new YargsAdapter(conversionSchema);
        const myImpl = new YargsBuilderImpl(conversionSchema, defaultHandlers);
        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          conversionSchema,
          defaultHandlers,
          adapter,
          myImpl
        );
        expect(builder).not.to.be.undefined();
      });
    }); // given: builder using non default impl
  }); // YargsBuilder constructor defaults

  context('collective', () => {
    const copy = {
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
            }
          }
        }
      ]
    };

    const move = {
      name: 'move',
      describe: 'Move file',
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
            }
          }
        }
      ]
    };

    context('given: collective specified as a map object', () => {
      it('should: build all commands', () => {
        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          conversionSchema,
          defaultHandlers
        );

        const container = {
          commands: {
            copy: copy,
            move: move
          }
        };

        builder.buildAllCommands(container);
      });
    });

    context('given: collective specified as an array', () => {
      it('should: build all commands', () => {
        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          conversionSchema,
          defaultHandlers
        );

        const container = {
          commands: [copy, move]
        };

        builder.buildAllCommands(container, (yin: yargs.Argv, optionName: string,
          optionDef: { [key: string]: any },
          positional: boolean,
          adaptedCommand: { [key: string]: any },
          callback: xiberia.IDefaultYargsOptionCallback): yargs.Argv => yin);
      });
    });

    context('given: collective path which does not exist', () => {
      it('should: throw', () => {
        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          conversionSchema,
          defaultHandlers
        );

        const container = {
          misplaced: [copy, move]
        };

        expect(() => {
          builder.buildAllCommands(container);
        }).to.throw();
      });
    });

    context('given: collective of invalid type', () => {
      it('should: throw', () => {
        const builder: build.YargsBuilder = new build.YargsBuilder(
          instance,
          conversionSchema,
          defaultHandlers
        );

        const container = {
          commands: 'wrong-type',
          misplaced: [copy, move]
        };

        expect(() => {
          builder.buildAllCommands(container);
        }).to.throw();
      });
    });
  });
}); // YargsBuilder

describe('default command', () => {
  let instance: yargs.Argv;

  beforeEach(() => {
    instance = require('yargs');
  });

  context('given: More than a single command being marked as the default', () => {
    it('should: throw', () => {
      const copy = {
        name: 'copy',
        describe: 'Copy file',
        default: true,
        _children: [
          {
            _: 'Arguments',
            _children: {
              to: {
                describe: 'destination file location'
              }
            }
          }
        ]
      };

      const move = {
        name: 'move',
        describe: 'Move file',
        default: true,
        _children: [
          {
            _: 'Arguments',
            _children: {
              to: {
                describe: 'destination file location'
              }
            }
          }
        ]
      };

      const container = {
        commands: {
          copy: copy,
          move: move
        }
      };

      const builder: build.YargsBuilder = new build.YargsBuilder(
        instance,
        conversionSchema
      );

      expect(() => {
        builder.buildAllCommands(container);
      }).to.throw();
    });
  });
});
