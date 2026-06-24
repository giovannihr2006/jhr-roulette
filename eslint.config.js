import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist/**',
    'dist-ssr/**',
    'release/**',
    'reference/**',
    'scripts/**',
    'preview_*/**',
    '_backups/**',
    'backups/**',
    'temp_archive/**',
    'node_modules/**',
    '.venv/**',
    '.agent/**',
    'SECURITY_VAULT/**',
    'android/app/src/main/assets/public/**',
    'android/app/build/**',
    'android/build/**',
    'src_backup*/**',
    'src/scripts/**',
    'src/utils/analyze_*.js',
    'src/utils/find_*.js',
    'src/utils/verify_calcs.js',
    'analysis_*.js',
    'analyze_*.js',
    'simulate_*.js',
    'temp_sim.js',
    'verify_*.js',
    '*.json',
  ]),
  {
    files: ['src/**/*.{js,jsx}', 'vite.config.js'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[_A-Z]', argsIgnorePattern: '^[_A-Z]' }],
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/rules-of-hooks': 'warn',
      'react-refresh/only-export-components': 'off',
      'no-undef': 'warn',
      'no-case-declarations': 'warn',
    },
  },
  {
    files: ['src/tests/**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest,
      },
    },
  },
  {
    files: ['vite.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
