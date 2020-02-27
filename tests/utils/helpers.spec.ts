import { expect, use } from 'chai';
import { uniquePairs, startsWithAny, pickArguments } from '../../lib/utils/helpers';
import * as R from 'ramda';
import dirtyChai = require('dirty-chai'); use(dirtyChai);
import sinonChai = require('sinon-chai'); use(sinonChai);

describe('helpers', () => {
  context('reduceUniquePair', () => {
    context('given: an empty sequence', () => {
      it('should: return empty collection', () => {
        const sequence: number[] = [];
        const result = uniquePairs(sequence);
        expect(result).to.deep.equal([]);
      });
    });

    context('given: a single item sequence', () => {
      it('should: return empty collection', () => {
        const sequence = [1];
        const result = uniquePairs(sequence);
        expect(result).to.deep.equal([]);
      });
    });

    context('given: sequence of 2 items', () => {
      it('should: return a single pair', () => {
        const sequence = [1, 2];
        const result = uniquePairs(sequence);
        expect(result).to.deep.equal([[1, 2]]);
      });
    });

    context('given: sequence of 3 items', () => {
      it('should: return a sequence of 3 pairs', () => {
        const sequence = [1, 2, 3];
        const result = uniquePairs(sequence);
        expect(result.length).to.deep.equal(3);
      });
    });

    context('given: sequence of 4 items', () => {
      it('should: return a sequence of 6 pairs', () => {
        const sequence = [1, 2, 3, 4];
        const result = uniquePairs(sequence);
        expect(result.length).to.deep.equal(6);
      });
    });

    context('given: sequence of 2 non primitive items with custom get', () => {
      it('should: return a single pair', () => {
        const sequence = [
          { name: 'producer', _: 'ArgumentRef' },
          { name: 'header', _: 'ArgumentRef' }
        ];
        const get = (v: { name: string }) => v.name;
        const result = uniquePairs(sequence, get);
        expect(result.length).to.equal(1);
      });
    });

    context('given: sequence of 2 non primitive items with custom get & equals', () => {
      it('should: return a single pair', () => {
        const sequence = [
          { name: 'producer', _: 'ArgumentRef' },
          { name: 'header', _: 'ArgumentRef' }
        ];
        const get = (v: { name: string }) => v.name;
        const equals = (a: { name: string }, b: { name: string }): boolean => {
          return a.name === b.name;
        };
        const result = uniquePairs(sequence, get, equals);
        expect(result.length).to.equal(1);
      });
    });

    context('given: sequence of 4 non primitive items with string core values', () => {
      it('should: return 6 pairs', () => {
        const sequence = [
          { name: 'header', _: 'ArgumentRef' },
          { name: 'producer', _: 'ArgumentRef' },
          { name: 'director', _: 'ArgumentRef' },
          { name: 'genre', _: 'ArgumentRef' }
        ];
        const get = (v: { name: string }) => v.name;
        const equals = (a: { name: string }, b: { name: string }): boolean => {
          return a.name === b.name;
        };
        const result = uniquePairs(sequence, get, equals);
        expect(result.length).to.equal(6);
      });
    });
  }); // reduceUniquePair

  context('startsWithAny', () => {
    context('given: a single element array, which does not match', () => {
      it('should: return false', () => {
        const result = startsWithAny(['one'], 'lazy brown fox');
        expect(result).to.be.false();
      });
    });

    context('given: a 2 element array, neither of which match', () => {
      it('should: return false', () => {
        const result = startsWithAny(['one', 'two'], 'lazy brown fox');
        expect(result).to.be.false();
      });
    });

    context('given: a multiple element array, first item matches', () => {
      it('should: return true', () => {
        const result = startsWithAny(['lazy', 'one', 'two', 'three'], 'lazy brown fox');
        expect(result).to.be.true();
      });
    });

    context('given: a multiple element array, last item matches', () => {
      it('should: return true', () => {
        const result = startsWithAny(['one', 'two', 'three', 'lazy'], 'lazy brown fox');
        expect(result).to.be.true();
      });
    });
  }); // startsWithAny

  context('pickArguments', () => {
    context('given: positionalType = "positional"', () => {
      it('should: return positional arguments only', () => {
        const argumentsMap = {
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
        };
        const positionalDef = 'from to';
        const positionalArguments = pickArguments(argumentsMap, positionalDef, 'positional');
        expect(R.has('from')(positionalArguments)).to.be.true();
        expect(R.has('to')(positionalArguments)).to.be.true();
        expect(R.has('log')(positionalArguments)).to.be.false();
        expect(R.has('owner')(positionalArguments)).to.be.false();
      });
    });
  }); // pickArguments
}); // helpers
