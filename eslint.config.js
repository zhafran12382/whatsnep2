import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
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
      // motion is used as JSX component like <motion.div>
      // Also ignore vars starting with uppercase (React components) or 'motion'
      // caughtErrors: 'none' to allow catch(error) without using error
      'no-unused-vars': ['warn', { 
        varsIgnorePattern: '^[A-Z]|^motion$',
        argsIgnorePattern: '^_|^Icon$',
        destructuredArrayIgnorePattern: '^_',
        ignoreRestSiblings: true,
        caughtErrors: 'none',
      }],
      // Allow context files to export hooks
      'react-refresh/only-export-components': ['warn', { allowExportNames: ['useAuth', 'useChat'] }],
    },
  },
])
