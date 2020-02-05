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

function defaultYargsFailHandler (msg: string, err: Error, yin: yargs.Argv)
  : yargs.Argv {
  // console.log(`*** defaultYargsFailHandler ===> FAIL: ${msg}`);
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
            expect(() => {
              builderImpl.buildCommand(instance, command, defaultYargsFailHandler);
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
            const yin = builderImpl.buildCommand(instance, command, failHandler);
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
      });
    });
  }); // Arguments and ArgumentGroups

  // define a positional argument, with a field only allowed for options
}); // YargsBuilderImpl without custom option handler

describe('YargsBuilderImpl WITH custom option handler', () => {
  let instance: yargs.Argv;
  let invoked: boolean;
  let handler: types.IDefaultAeYargsOptionHandler;

  beforeEach(() => {
    instance = require('yargs');
    invoked = false;

    handler = (yin: yargs.Argv,
      optionName: string,
      optionDef: { [key: string]: any },
      positional: boolean,
      callback: types.IAeYargsOptionCallback): yargs.Argv => {
      const result = callback(yin, optionName, optionDef, positional);
      invoked = true;
      return result;
    };
  });

  context('Arguments only', () => {
    context('Without any positional arguments', () => {
      context('given: a command with multiple options', () => {
        it('should: build command with multiple parsed options', () => {
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

    context('With positional arguments', () => {
      context('given: a command multiple arguments', () => {
        it('should: build command with multiple parsed arguments', () => {
          const builderImpl: YargsBuilderImpl = new YargsBuilderImpl(handler, aeSchema);
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
      });
    });
  }); // Arguments only
}); // YargsBuilderImpl WITH custom option handler

describe('YargsBuilderImpl', () => {
  let instance: yargs.Argv;
  const handler: null = null;
  let builderImpl: YargsBuilderImpl;

  beforeEach(() => {
    instance = require('yargs');
    builderImpl = new YargsBuilderImpl(handler, aeSchema);
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
        });
      });
    });
  }); // decoratePositionalDef

  context('handlePositional', () => {
    context('given: undefined positional string', () => {
      it('should: do nothing', () => {
        builderImpl.handlePositional(instance, undefined as unknown as string, {});
      });
    });

    context('given: empty positional string', () => {
      it('should: do nothing', () => {
        builderImpl.handlePositional(instance, '', {});
      });
    });
  }); // handlePositional
}); // decoratePositionalDef

describe('universal option/argument check', () => {
  let instance: yargs.Argv;
  const handler: null = null;
  let builderImpl: YargsBuilderImpl;

  beforeEach(() => {
    instance = require('yargs');
    builderImpl = new YargsBuilderImpl(handler, aeSchema);
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
          const yin = builderImpl.buildCommand(instance, command, defaultYargsFailHandler);
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
          const yin = builderImpl.buildCommand(instance, command, defaultYargsFailHandler);
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
});
