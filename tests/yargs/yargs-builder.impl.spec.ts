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
  let instance: yargs.Argv;

  beforeEach(() => {
    builderImpl = new YargsBuilderImpl(handler, aeSchema);
    instance = require('yargs');
  });

  // WHAT ABOUT FLAG/SWITCH OPTIONS !!! (don't have an argument)

  context('Arguments only', () => {
    context('Without any positional arguments', () => {
      context('given: a command with a single option', () => {
        it('should: build command with single parsed option', () => {
          const command = {
            name: 'copy',
            describe: 'Copy file',
            _children: [
              {
                _: 'Arguments',
                _children: {
                  to: {
                    alias: 't',
                    describe: 'destination file location',
                  }
                }
              }
            ]
          };
          const yin = builderImpl.buildCommand(instance, command, defaultYargsFailHandler);
          const result = yin.parse(['copy', '-t', '~/destination/front.jpg']);

          expect(result.t).to.equal('~/destination/front.jpg');
          expect(result.to).to.equal('~/destination/front.jpg');
        });
      });

      context('given: a command with multiple options', () => {
        it('should: build command with multiple parsed options', () => {
          const command = {
            name: 'copy',
            describe: 'Copy file',
            _children: [
              {
                _: 'Arguments',
                _children: {
                  to: {
                    alias: 't',
                    describe: 'destination file location'
                  },
                  log: {
                    alias: 'l',
                    describe: 'log file'
                  },
                  owner: {
                    alias: 'o',
                    describe: 'set owner to'
                  }
                }
              }
            ]
          };
          const yin = builderImpl.buildCommand(instance, command, defaultYargsFailHandler);
          const result = yin.parse(['copy', '-t', '~/destination/front.jpg',
            '--log', '~/logs/fs.log', '-o', '$(whoami)']);

          expect(result.t).to.equal('~/destination/front.jpg');
          expect(result.to).to.equal('~/destination/front.jpg');

          expect(result.l).to.equal('~/logs/fs.log');
          expect(result.log).to.equal('~/logs/fs.log');

          expect(result.o).to.equal('$(whoami)');
          expect(result.owner).to.equal('$(whoami)');
        });
      }); // given: a command with multiple options
    }); // Without any positional arguments

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
                  from: {
                    describe: 'source file location'
                  },
                  to: {
                    alias: 't',
                    describe: 'destination file location',
                    demandOption: true
                  }
                }
              }
            ]
          };
          const yin = builderImpl.buildCommand(instance, command, defaultYargsFailHandler);
          const result = yin.parse(['copy', '~/source/front.jpg', '-t', '~/destination/front.jpg']);

          expect(result.from).to.equal('~/source/front.jpg');

          expect(result.t).to.equal('~/destination/front.jpg');
          expect(result.to).to.equal('~/destination/front.jpg');
        });
      });

      context('given: a command multiple arguments', () => {
        it('should: build command with multiple parsed arguments', () => {
          const command = {
            name: 'copy',
            describe: 'Copy file',
            positional: 'from',
            _children: [
              {
                _: 'Arguments',
                _children: {
                  from: {
                    describe: 'source file location'
                  },
                  to: {
                    alias: 't',
                    describe: 'destination file location'
                  },
                  log: {
                    alias: 'l',
                    describe: 'log file'
                  },
                  owner: {
                    alias: 'o',
                    describe: 'set owner to'
                  }
                }
              }
            ]
          };
          const yin = builderImpl.buildCommand(instance, command, defaultYargsFailHandler);
          const result = yin.parse(['copy', '~/source/front.jpg',
            '-t', '~/destination/front.jpg', '--log', '~/logs/fs.log', '-o', '$(whoami)']);

          expect(result.from).to.equal('~/source/front.jpg');

          expect(result.t).to.equal('~/destination/front.jpg');
          expect(result.to).to.equal('~/destination/front.jpg');

          expect(result.l).to.equal('~/logs/fs.log');
          expect(result.log).to.equal('~/logs/fs.log');

          expect(result.o).to.equal('$(whoami)');
          expect(result.owner).to.equal('$(whoami)');
        });
      }); // given: a command multiple arguments

      context('given: a command multiple positional arguments', () => {
        it('should: build command with multiple parsed arguments', () => {
          const command = {
            name: 'copy',
            describe: 'Copy file',
            positional: 'from to',
            _children: [
              {
                _: 'Arguments',
                _children: {
                  from: {
                    describe: 'source file location'
                  },
                  to: {
                    alias: 't',
                    describe: 'destination file location'
                  },
                  log: {
                    alias: 'l',
                    describe: 'log file'
                  },
                  owner: {
                    alias: 'o',
                    describe: 'set owner to'
                  }
                }
              }
            ]
          };
          const yin = builderImpl.buildCommand(instance, command, defaultYargsFailHandler);
          const result = yin.parse(['copy', '~/source/front.jpg',
            '~/destination/front.jpg', '--log', '~/logs/fs.log', '-o', '$(whoami)']);

          expect(result.from).to.equal('~/source/front.jpg');

          expect(result.to).to.equal('~/destination/front.jpg');

          expect(result.l).to.equal('~/logs/fs.log');
          expect(result.log).to.equal('~/logs/fs.log');

          expect(result.o).to.equal('$(whoami)');
          expect(result.owner).to.equal('$(whoami)');
        });
      }); // given: a command multiple positional arguments

      context('Error handling', () => {
        context('given: a command with missing positional argument definition', () => {
          it('should: build command with multiple parsed arguments', () => {
            const command = {
              name: 'copy',
              describe: 'Copy file',
              positional: 'from to',
              _children: [
                {
                  _: 'Arguments',
                  _children: {
                    from: {
                      describe: 'source file location'
                    },
                    // "to" argument definition is missing
                    log: {
                      alias: 'l',
                      describe: 'log file'
                    },
                    owner: {
                      alias: 'o',
                      describe: 'set owner to'
                    }
                  }
                }
              ]
            };
            // builderImpl.buildCommand(instance, command, defaultYargsFailHandler);
            expect(() => {
              builderImpl.buildCommand(instance, command, defaultYargsFailHandler);
            }).to.throw();
          });
        }); // given: a command with missing positional argument definition
      }); // Error handling
    }); // With positional arguments
  }); // Arguments only

  context('Arguments and ArgumentGroups', () => {
    context('Without any positional arguments', () => {
      context('given: a command with multiple options', () => {
        it('should: build command with multiple parsed options', () => {
          const command = {
            name: 'copy',
            describe: 'Copy file',
            _children: [
              {
                _: 'Arguments',
                _children: {
                  to: {
                    alias: 't',
                    describe: 'destination file location'
                  },
                  log: {
                    alias: 'l',
                    describe: 'log file'
                  },
                  print: {
                    alias: 'p',
                    describe: 'print file'
                  }
                }
              },
              {
                _: 'ArgumentGroups',
                _children: [
                  {
                    _: 'Conflicts',
                    _children: [
                      { name: 'log', _: 'ArgumentRef' },
                      { name: 'print', _: 'ArgumentRef' }
                    ]
                  }
                ]
              }
            ]
          };
          const yin = builderImpl.buildCommand(instance, command, defaultYargsFailHandler);
          const result = yin.parse(['copy', '-t', '~/destination/front.jpg',
            '--log', '~/logs/fs.log']);

          expect(result.t).to.equal('~/destination/front.jpg');
          expect(result.to).to.equal('~/destination/front.jpg');

          expect(result.l).to.equal('~/logs/fs.log');
          expect(result.log).to.equal('~/logs/fs.log');
        });
      }); // given: a command with multiple options
    }); // Without any positional arguments

    context('With positional arguments', () => {
      context('given: a command multiple arguments', () => {
        it('should: build command with multiple parsed arguments', () => {
          const command = {
            name: 'copy',
            describe: 'Copy file',
            positional: 'from to',
            _children: [
              {
                _: 'Arguments',
                _children: {
                  from: {
                    describe: 'source file location'
                  },
                  to: {
                    describe: 'destination file location'
                  },
                  log: {
                    alias: 'l',
                    describe: 'log file'
                  },
                  owner: {
                    alias: 'o',
                    describe: 'set owner to'
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
          const yin = builderImpl.buildCommand(instance, command, defaultYargsFailHandler);
          const result = yin.parse(['copy', '~/source/front.jpg',
            '~/destination/front.jpg', '--log', '~/logs/fs.log', '-o', '$(whoami)']);

          // expect(result.from).to.equal('~/source/front.jpg');

          // expect(result.to).to.equal('~/destination/front.jpg');

          // expect(result.l).to.equal('~/logs/fs.log');
          // expect(result.log).to.equal('~/logs/fs.log');

          // expect(result.o).to.equal('$(whoami)');
          // expect(result.owner).to.equal('$(whoami)');
        });
      });
    });
  }); // Arguments and ArgumentGroups

  // define a positional argument, with a field only allowed for options
}); // YargsBuilderImpl without custom option handler

// function defaultOptionHandler (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
//   positional: boolean,
//   _: types.IAeYargsOptionHandler)
//   : yargs.Argv {

//   return positional
//     ? yin.positional(optionName, optionDef)
//     : yin.option(optionDef);
// }

describe.skip('YargsBuilderImpl WITH custom option handler', () => {
  let instance: yargs.Argv;

  beforeEach(() => {
    instance = require('yargs');
  });

  context('Arguments only', () => {
    context('!!!! Without any positional arguments', () => {
      context('given: a command with multiple options', () => {
        it('should: build command with multiple parsed options', () => {
          const handler: types.IAeYargsOptionHandler = (yin: yargs.Argv,
            optionName: string, optionDef: { [key: string]: any },
            positional: boolean,
            def: types.IAeYargsOptionHandler): yargs.Argv => {
            return def(yin, optionName, optionDef, positional, def);
          };
          const builderImpl: YargsBuilderImpl = new YargsBuilderImpl(handler, aeSchema);

          const command = {
            name: 'copy',
            describe: 'Copy file',
            _children: [
              {
                _: 'Arguments',
                _children: {
                  to: {
                    alias: 't',
                    describe: 'destination file location'
                  },
                  log: {
                    alias: 'l',
                    describe: 'log file'
                  },
                  owner: {
                    alias: 'o',
                    describe: 'set owner to'
                  }
                }
              }
            ]
          };
          const yin = builderImpl.buildCommand(instance, command, defaultYargsFailHandler);
          const result = yin.parse(['copy', '-t', '~/destination/front.jpg',
            '--log', '~/logs/fs.log', '-o', '$(whoami)']);

          expect(result.t).to.equal('~/destination/front.jpg');
          expect(result.to).to.equal('~/destination/front.jpg');

          expect(result.l).to.equal('~/logs/fs.log');
          expect(result.log).to.equal('~/logs/fs.log');

          expect(result.o).to.equal('$(whoami)');
          expect(result.owner).to.equal('$(whoami)');
        });
      }); // given: a command with multiple options
    });

    context('!!!!!With positional arguments', () => {
      //
    });
  }); // Arguments only
}); // YargsBuilderImpl WITH custom option handler

describe('YargsBuilderImpl.decoratePositionalDef', () => {
  context('given: ???', () => {
    //
  });
}); // decoratePositionalDef

// ===================================================================================================

function defaultOptionHandler (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
  positional: boolean)
  : yargs.Argv {

  return positional
    ? yin.positional(optionName, optionDef)
    : yin.option(optionDef);
}
class Host {
  constructor (private handler: types.IDefaultAeYargsOptionHandler = defaultOptionHandler) { }
  readonly yin: yargs.Argv = require('yargs');

  invoke () {
    if (this.handler) {
      const optionDef = {};
      const positional = true;
      this.handler(this.yin, 'OPTION-NAME', optionDef, positional, defaultOptionHandler);
    }
  }
}

describe('DEFINE OPTION HANDLER', () => {
  it('give callback to HOST', () => {
    // THIS IS CLIENT SIDE
    //
    const host = new Host((yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
      positional: boolean,
      callback: types.IAeYargsOptionCallback): yargs.Argv => {
      return callback(yin, optionName, optionDef, positional);
    });
  });
});
