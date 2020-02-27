module.exports = {
  env: {
    node: true,
    browser: true,
    es6: true,
    mocha: true
  },
  extends: [
    'semistandard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
      "args": "none"
    }],
    "@typescript-eslint/no-useless-constructor": "error",
    "no-useless-constructor": "off"
  }
}
