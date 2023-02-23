/* global module */
module.exports = {
  'env': {
    'browser': true,
    'es2021': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module'
  },
  'plugins': [
    'react',
    '@typescript-eslint'
  ],
  'rules': {
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/ban-ts-comment': 1,
    'comma-style': [2, 'last'],
    'comma-spacing': [2, {
      'before': false,
      'after': true
    }],
    'indent': [2, 2, {
      'SwitchCase': 1
    }],
    'object-curly-spacing': [2, 'always'],
    'quotes': [2, 'single', {
      'avoidEscape': true,
      'allowTemplateLiterals': true
    }],
    'react/display-name': 0,
    'semi': 2,
    'space-infix-ops': 2,
  }
};
