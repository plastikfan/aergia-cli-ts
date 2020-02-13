import { functify } from 'jinxed';
import { expect, use } from 'chai';
import dirtyChai = require('dirty-chai');
use(dirtyChai);
import * as yargs from 'yargs';
import * as R from 'ramda';
import * as types from '../../lib/types';

import { YargsBuilderImpl, defaultHandlers } from '../../lib/yargs/yargs-builder.impl';

const aeSchema: types.IAeYargsSchema = Object.freeze({
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
});

describe('YargsBuilderImpl without custom option handler', () => {
  let builderImpl: YargsBuilderImpl;
  let instance: yargs.Argv;

  beforeEach(() => {
    builderImpl = new YargsBuilderImpl(aeSchema, defaultHandlers);
    instance = require('yargs');
  });

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
                    describe: 'destination file location'
                  }
                }
              }
            ]
          };
          const yin = builderImpl.buildCommand(instance, command);
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
          const yin = builderImpl.buildCommand(instance, command);
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
          const yin = builderImpl.buildCommand(instance, command);
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
          const yin = builderImpl.buildCommand(instance, command);
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
          const yin = builderImpl.buildCommand(instance, command);
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
            expect(() => {
              builderImpl.buildCommand(instance, command);
            }).to.throw();
          });
        }); // given: a command with missing positional argument definition

        context('given: correctly defined command invoked with invalid choice', () => {
          it('should: invoke fail handler', () => {
            let invoked = false;
            function failHandler (msg: string, err: Error, yin: yargs.Argv)
              : yargs.Argv {
              invoked = true;
              return yin;
            }
            const myDefaultHandlers: types.IAeYargsBuildHandlers = {
              onFail: failHandler
            };
            const myBuilderImpl = new YargsBuilderImpl(aeSchema, myDefaultHandlers);

            const command = {
              name: 'paint',
              describe: 'Perform a paint action with the colour specified',
              _children: [
                {
                  _: 'Arguments',
                  _children: {
                    colour: {
                      describe: 'colour of brush to use in paint action',
                      choices: ['red', 'white', 'blue']
                    }
                  }
                }
              ]
            };
            const yin = myBuilderImpl.buildCommand(instance, command);
            yin.parse(['paint', '--colour', 'green']);
            expect(invoked).to.be.true();
          });
        });
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
                  { // conflicts validator
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
          const yin = builderImpl.buildCommand(instance, command);
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
                  { // implies validator
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
          const yin = builderImpl.buildCommand(instance, command);
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
    });
  }); // Arguments and ArgumentGroups

  // define a positional argument, with a field only allowed for options
}); // YargsBuilderImpl without custom option handler

describe('YargsBuilderImpl WITH custom option handler', () => {
  const command = Object.freeze({
    name: 'copy',
    describe: 'Copy file',
    _children: [
      {
        _: 'Arguments',
        _children: {
          to: {
            alias: 't',
            describe: 'destination file location'
          }
        }
      }
    ]
  });

  let instance: yargs.Argv;
  let memberInvoked: boolean;

  function memberOptionHandler (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
    positional: boolean)
    : yargs.Argv {
    memberInvoked = true;

    return positional
      ? yin.positional(optionName, optionDef)
      : yin.option(optionName, optionDef);
  }

  function memberBeforeCommandHandler (yin: yargs.Argv, commandDescription: string,
    helpDescription: string, adaptedCommand: { [key: string]: any })
    : yargs.Argv {
    memberInvoked = true;

    return yin;
  }

  function memberAfterCommandHandler (yin: yargs.Argv)
    : yargs.Argv {
    memberInvoked = true;

    return yin;
  }

  beforeEach(() => {
    instance = require('yargs');
    memberInvoked = false;
  });

  context('member handlers invocation', () => {
    context('given: custom option handler', () => {
      it('should: invoke custom option handler', () => {
        const handlers: types.IAeYargsBuildHandlers = {
          onOption: memberOptionHandler
        };

        const myImpl: YargsBuilderImpl = new YargsBuilderImpl(aeSchema, handlers);
        const yin = myImpl.buildCommand(instance, command);
        yin.parse(['copy', '--to', '~/destination.front.jpg']);
        expect(memberInvoked).to.be.true();
      });
    });

    context('given: custom before command handler', () => {
      it('should: invoke custom before command handler', () => {
        const handlers: types.IAeYargsBuildHandlers = {
          onBeforeCommand: memberBeforeCommandHandler
        };

        const myImpl: YargsBuilderImpl = new YargsBuilderImpl(aeSchema, handlers);
        const yin = myImpl.buildCommand(instance, command);
        yin.parse(['copy', '--to', '~/destination.front.jpg']);
        expect(memberInvoked).to.be.true();
      });
    });

    context('given: custom after command handler', () => {
      it('should: invoke custom after command handler', () => {
        const handlers: types.IAeYargsBuildHandlers = {
          onAfterCommand: memberAfterCommandHandler
        };

        const myImpl: YargsBuilderImpl = new YargsBuilderImpl(aeSchema, handlers);
        const yin = myImpl.buildCommand(instance, command);
        yin.parse(['copy', '--to', '~/destination.front.jpg']);
        expect(memberInvoked).to.be.true();
      });
    });
  }); // member handlers invocation

  context('local handler override member handlers', () => {
    context('given: local option handler', () => {
      it('should: local handler should override custom option handler', () => {
        let overridden = false;

        function localOptionHandler (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
          positional: boolean)
          : yargs.Argv {
          overridden = true;

          return positional
            ? yin.positional(optionName, optionDef)
            : yin.option(optionName, optionDef);
        }

        const handlers: types.IAeYargsBuildHandlers = {
          onOption: memberOptionHandler
        };

        const builderImpl: YargsBuilderImpl = new YargsBuilderImpl(aeSchema, handlers);
        const yin = builderImpl.buildCommand(instance, command, localOptionHandler);
        yin.parse(['copy', '--to', '~/destination.front.jpg']);
        expect(memberInvoked).to.be.false();
        expect(overridden).to.be.true();
      });
    });
  }); // local handler override member handlers

  context('Arguments only', () => {
    context('Without any positional arguments', () => {
      context('given: a command with multiple options', () => {
        it('should: build command with multiple parsed options', () => {
          const builderImpl: YargsBuilderImpl = new YargsBuilderImpl(aeSchema, defaultHandlers);
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
          const yin = builderImpl.buildCommand(instance, command);
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

    context('With positional arguments', () => {
      context('given: a command multiple arguments', () => {
        it('should: build command with multiple parsed arguments', () => {
          const builderImpl: YargsBuilderImpl = new YargsBuilderImpl(aeSchema, defaultHandlers);
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
              }
            ]
          };
          const yin = builderImpl.buildCommand(instance, command);
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
    });
  }); // Arguments only
}); // YargsBuilderImpl WITH custom option handler

describe('YargsBuilderImpl', () => {
  let instance: yargs.Argv;
  let builderImpl: YargsBuilderImpl;

  beforeEach(() => {
    instance = require('yargs');
    builderImpl = new YargsBuilderImpl(aeSchema, defaultHandlers);
  });

  context('decoratePositionalDef', () => {
    context('given: undefined positional string', () => {
      it('should: return empty string', () => {
        const result = builderImpl.decoratePositionalDef('copy', undefined as unknown as string, {});
        expect(result).to.equal('');
      });
    });

    context('given: empty positional string', () => {
      it('should: return empty string', () => {
        const result = builderImpl.decoratePositionalDef('copy', '', {});
        expect(result).to.equal('');
      });
    });

    context('given: mandatory positional argument', () => {
      it('should: correctly decorated positional string', () => {
        const argumentsMap = {
          to: {
            describe: 'destination file location',
            demandOption: true
          }
        };

        const result = builderImpl.decoratePositionalDef('copy', 'to', argumentsMap);
        expect(result).to.equal('copy <to>');
      });
    });

    context('given: an argument definition that is not an object', () => {
      it('should: return empty string', () => {
        const argumentsMap = {
          from: 'source file location',
          to: {
            describe: 'destination file location'
          }
        };

        expect(() => {
          builderImpl.decoratePositionalDef('copy', 'from to', argumentsMap);
        }).to.throw();
      });
    });

    context('given: an positional argument definition that is not an object', () => {
      it('should: return empty string', () => {
        const argumentsMap = {
          to: 'destination file location'
        };

        expect(() => {
          builderImpl.decoratePositionalDef('copy', 'to', argumentsMap);
        }).to.throw();
      });
    });
  }); // decoratePositionalDef

  context('handlePositional', () => {
    context('given: undefined positional string', () => {
      it('should: do nothing', () => {
        builderImpl.handlePositional(instance, undefined as unknown as string, {}, {});
      });
    });

    context('given: empty positional string', () => {
      it('should: do nothing', () => {
        builderImpl.handlePositional(instance, '', {}, {});
      });
    });
  }); // handlePositional

  context('handleValidationGroups', () => {
    context('given: validator group type which is neither "conflicts" or "implies"', () => {
      it('should: do nothing', () => {
        const groups = [{
          _: 'ArgumentGroups',
          _children: [
            {
              _: 'BadValidator',
              _children: [
                { name: 'log', _: 'ArgumentRef' },
                { name: 'print', _: 'ArgumentRef' }
              ]
            }
          ]
        }];
        builderImpl.handleValidationGroups(instance, groups);
      });
    });

    context('given: validator group with multiple items in same "conflicts" group"', () => {
      it('should: just do it!', () => {
        const groups = [{
          _: 'ArgumentGroups',
          _children: [
            {
              _: 'Conflicts',
              _children: [
                { name: 'log', _: 'ArgumentRef' },
                { name: 'print', _: 'ArgumentRef' },
                { name: 'tail', _: 'ArgumentRef' },
                { name: 'tap', _: 'ArgumentRef' }
              ]
            }
          ]
        }];
        builderImpl.handleValidationGroups(instance, groups);
      });
    });
  }); // handleValidationGroups
}); // YargsBuilderImpl

describe('default command', () => {
  let instance: yargs.Argv;
  let builderImpl: YargsBuilderImpl;
  let commandInvoked: string;

  beforeEach(() => {
    instance = require('yargs');
    builderImpl = new YargsBuilderImpl(aeSchema, defaultHandlers);
    commandInvoked = undefined as unknown as string;
  });

  function localOptionHandler (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
    positional: boolean, adaptedCommand: { [key: string]: any },
    callback: types.IDefaultAeYargsOptionCallback)
    : yargs.Argv {

    yin = callback(yin, optionName, optionDef, positional);
    commandInvoked = adaptedCommand.name;

    return positional
      ? yin.positional(optionName, optionDef)
      : yin.option(optionName, optionDef);
  }

  const copy = Object.freeze({
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
  });

  context('None positional options', () => {
    context('given: a command has been marked as the default and missing from command line', () => {
      it('should: invoke copy command', () => {
        instance = builderImpl.buildCommand(instance, copy, localOptionHandler);

        const result = instance.parse([
          // copy command not specified here, but it has been set as the default command.
          //
          '--to', '~/destination/front.jpg'
        ]);

        expect(result.to).to.equal('~/destination/front.jpg');
        expect(commandInvoked).to.equal('copy');
      });
    });

    context('given: a command has been marked as the default and present on command line', () => {
      it('should: invoke copy command', () => {
        instance = builderImpl.buildCommand(instance, copy, localOptionHandler);

        const result = instance.parse([
          'copy', // <--
          '--to', '~/destination/front.jpg'
        ]);

        expect(result.to).to.equal('~/destination/front.jpg');
        expect(commandInvoked).to.equal('copy');
      });
    });
  }); // None positional options

  context('Positional arguments', () => {
    // Positional arguments don't work on the default command when the command name is
    // missing from he command line; arguments without an option key, turn up in "_" array.
    // (See http://yargs.js.org/docs/#api-argv)
    //
    const commandWithPositionalArg = R.set(R.lensProp('positional'), 'to')(R.clone(copy));

    context('given: a command has been marked as the default and missing from command line', () => {
      it('should: invoke copy command', () => {
        instance = builderImpl.buildCommand(instance, commandWithPositionalArg, localOptionHandler);

        const result = instance.parse([
          // copy command not specified here, but it has been set as the default command.
          //
          '~/destination/front.jpg'
        ]);

        const _: string[] = R.prop('_')(result);
        expect(_[0]).to.equal('~/destination/front.jpg');
        expect(result.to).to.be.undefined();
      });
    });
  });

  context('given: a command with falsy default setting and missing from command line', () => {
    it('should: NOT invoke copy command', () => {
      const falsyDefaultCopy = R.set(R.lensProp('default'), false)(R.clone(copy));
      instance = builderImpl.buildCommand(instance, falsyDefaultCopy, localOptionHandler);

      const result = instance.parse([
        // copy command not specified here, but it has been set as the default command.
        //
        '--to', '~/destination/front.jpg'
      ]);
      console.log(`>>> result: ${functify(result)}`);

      expect(result.to).to.equal('~/destination/front.jpg');
      expect(commandInvoked).to.be.undefined();
    });
  });
}); // default command

describe('universal option/argument check', () => {
  let instance: yargs.Argv;
  let builderImpl: YargsBuilderImpl;

  beforeEach(() => {
    instance = require('yargs');
    builderImpl = new YargsBuilderImpl(aeSchema, defaultHandlers);
  });

  context('positional argument', () => {
    context('given: valid option descriptor', () => {
      const tests: { ok: [string, any], ov?: string, expected?: any }[] = [
        { ok: ['alias', 'w'] },
        { ok: ['choices', ['red', 'white', 'blue']], ov: 'red', expected: 'red' },
        { ok: ['coerce', (arg: string) => { return `==[${arg}]==`; }], ov: 'red', expected: '==[red]==' },
        { ok: ['conflicts', ['bucket', 'spade']] },
        { ok: ['default', 'DEFAULT-VALUE'], expected: 'DEFAULT-VALUE' },
        { ok: ['defaultDescription', 'Roses are red'] },
        { ok: ['desc', 'widget type'] },
        { ok: ['describe', 'widget type'] },
        { ok: ['description', 'widget type'] },
        { ok: ['implies', ['bucket', 'spade']] },
        { ok: ['normalize', false] },
        { ok: ['type', 'string'], ov: '42', expected: '42' }
      ];

      tests.forEach((t: { ok: [string, any], ov?: string, expected?: any }) => {
        const descriptor: string = t.ok[0];
        it(`should: accept option descriptor: "${descriptor}" definition`, () => {
          const dummy = null;
          const lens = R.lensPath(['_children', 0, '_children', 'widget']);
          const optionDef: { [key: string]: any } = R.fromPairs([t.ok]);
          const optionValue = t.ov;

          const command: { [key: string]: any } = R.set(lens, optionDef)({
            name: 'invoke',
            describe: 'Getting things done with the invoker',
            positional: 'widget',
            _children: [
              {
                _: 'Arguments',
                _children: {
                  widget: dummy
                }
              }
            ]
          });
          const yin = builderImpl.buildCommand(instance, command);
          const result = optionValue
            ? yin.parse(['invoke', optionValue])
            : yin.parse(['invoke']);

          if (t.expected) {
            expect(result.widget).to.deep.equal(t.expected);
          }
        });
      });
    }); // given: valid option descriptor
  }); // positional argument

  context('non positional option', () => {
    context('given: valid option descriptor', () => {
      const tests: { ok: [string, any], ov?: string, expected?: any }[] = [
        { ok: ['alias', 'w'] },
        { ok: ['array', true], ov: 'yes no', expected: ['yes no'] },
        { ok: ['boolean', true], ov: 'false', expected: false },
        { ok: ['choices', ['red', 'white', 'blue']], ov: 'red', expected: 'red' },
        { ok: ['coerce', (arg: string) => { return `==[${arg}]==`; }], ov: 'red', expected: '==[red]==' },
        { ok: ['config', true], ov: '~/path/to/file.json', expected: '~/path/to/file.json' },
        { ok: ['configParser', true], ov: '~/path/to/file.json', expected: '~/path/to/file.json' },
        { ok: ['conflicts', ['bucket', 'spade']] },
        { ok: ['count', 2], ov: 'left right' },
        { ok: ['default', 'DEFAULT-VALUE'], expected: 'DEFAULT-VALUE' },
        { ok: ['defaultDescription', 'Roses are red'] },
        { ok: ['demandOption', true] },
        { ok: ['desc', 'widget type'] },
        { ok: ['describe', 'widget type'] },
        { ok: ['description', 'widget type'] },
        { ok: ['global', false] },
        { ok: ['group', 'LOCAL'] },
        { ok: ['hidden', false] },
        { ok: ['implies', ['bucket', 'spade']] },
        { ok: ['nargs', 2], ov: 'eggs bacon', expected: 'eggs bacon' },
        { ok: ['normalize', false] },
        { ok: ['number', true], ov: '42', expected: 42 },
        { ok: ['requiresArg', true], ov: 'pink', expected: 'pink' },
        { ok: ['skipValidation', true] },
        { ok: ['string', true], ov: '42', expected: '42' },
        { ok: ['type', 'string'], ov: '42', expected: '42' },
        // Non yargs option key; "fantasy" is not in yargs api, taken to make widget a flag:
        { ok: ['fantasy', 'unicorns'], expected: true }
      ];

      tests.forEach((t: { ok: [string, any], ov?: string, expected?: any }) => {
        const descriptor: string = t.ok[0];
        it(`should: accept option descriptor: "${descriptor}" definition`, () => {
          const dummy = null;
          const lens = R.lensPath(['_children', 0, '_children', 'widget']);
          const optionDef = R.fromPairs([t.ok]);
          const optionValue = t.ov;

          const command: { [key: string]: any } = R.set(lens, optionDef)({
            name: 'invoke',
            describe: 'Getting things done with the invoker',
            _children: [
              {
                _: 'Arguments',
                _children: {
                  widget: dummy
                }
              }
            ]
          });
          const yin = builderImpl.buildCommand(instance, command);
          const result = optionValue
            ? yin.parse(['invoke', '--widget', optionValue])
            : yin.parse(['invoke', '--widget']);

          if (t.expected) {
            expect(result.widget).to.deep.equal(t.expected);
          }
        });
      });
    });
  }); // non positional option
}); // universal option/argument check
