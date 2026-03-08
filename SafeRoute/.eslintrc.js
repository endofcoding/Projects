module.exports = {
  root: true,
  extends: ['prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    es2020: true,
    node: true,
  },
  rules: {
    'prettier/prettier': 'warn',
  },
  plugins: ['prettier'],
};
