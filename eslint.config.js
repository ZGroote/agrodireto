// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['**/dist/*', '**/node_modules/*', '**/.expo/*', '**/expo-env.d.ts'],
  },
  {
    // Cada app tem o seu alias "@/" (tsconfig próprio): o resolvedor lê todos.
    settings: {
      'import/resolver': {
        typescript: { project: ['apps/*/tsconfig.json', 'packages/*/tsconfig.json', 'services/*/tsconfig.json'], alwaysTryTypes: true },
        node: true,
      },
    },
  },
  {
    // Serviços Node (não são apps Expo): a regra que protege o embutimento de variáveis no app não se aplica.
    files: ['services/**/*.ts'],
    rules: { 'expo/no-dynamic-env-var': 'off' },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
]);
