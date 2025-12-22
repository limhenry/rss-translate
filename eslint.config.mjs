import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigGoogle from 'eslint-config-google';

export default tseslint.config(
  eslintConfigGoogle,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      'require-jsdoc': 'off',
      'valid-jsdoc': 'off',
      'new-cap': 'off',
    },
  },
);
