import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';

export default [
	{
		files: ['src/**/*.ts{,x}'],
		languageOptions: {
			ecmaVersion: 'latest',
			parser,
			parserOptions: {
				ecmaFeatures: {
					impliedStrict: true,
					jsx: true,
				},
				ecmaVersion: 'latest',
				jsxFragmentName: 'Fragment',
				jsxPragma: 'createElement',
				sourceType: 'module',
			},
			sourceType: 'module',
		},
		plugins: {
			react,
			'@typescript-eslint': typescript,
		},
		rules: {
			...js.configs.recommended.rules,
			'@typescript-eslint/no-non-null-assertion': 'off',
			'no-empty': ['error', { allowEmptyCatch: true }],
			...Object.assign({},
				...typescript.configs['eslint-recommended'].overrides.map(x => x.rules)
			),
			...typescript.configs.recommended.rules,
			...react.configs.recommended.rules,
			'react/prop-types': 'off',
		},
		settings: {
			react: {
				fragment: 'Fragment',
				pragma: 'createElement',
				version: 'detect',
			},
		},
	}
];
