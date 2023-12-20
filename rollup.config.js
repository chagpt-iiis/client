import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { extname, relative } from 'path';
import { defineConfig } from 'rollup';
import esbuild, { minify } from 'rollup-plugin-esbuild';
import externalGlobals from 'rollup-plugin-external-globals';

import { getRoot, jkmx } from './build.js';

const ROOT = getRoot();

function splitRule(id) {
	const relaPath = relative(ROOT, id);
	if (relaPath.startsWith('src/pages/'))
		return 'entry';
	return 'chagpt';
}

export default Promise.resolve().then(() => defineConfig({
	external: id => {
		switch (id) {
			case 'react': return true;
			case 'react-dom/client': return true;
			case 'semantic-ui-react': return true;
			case 'socket.io-client': return 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.2/socket.io.esm.min.js';
		}
		return false;
	},
	input: {
		main: './src/pages/main.tsx',
	},
	plugins: [
		commonjs(),
		nodeResolve({
			browser: true,
		}),
		replace({
			preventAssignment: true,
			values: {
				'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
			},
		}),
		esbuild({
			exclude: [],
			jsx: 'transform',
			jsxFactory: 'createElement',
			jsxFragment: 'Fragment',
			loaders: { '.js': false },
			target: 'esnext',
		}),
		externalGlobals({
			'react': 'React',
			'react-dom/client': 'ReactDOM',
			'semantic-ui-react': 'semanticUIReact',
		}),
		new jkmx,
	],
	output: {
		assetFileNames: assetInfo => {
			switch (extname(assetInfo.name)) {
				case '.ttf': return 'fonts/[name][extname]';
				case '.jpg':
				case '.png': return 'images/[name][extname]';
				default: return 'assets/[name][extname]';
			}
		},
		chunkFileNames: 'js/[name].[hash].js',
		compact: process.env.NODE_ENV === 'production',
		dir: './dist',
		entryFileNames: 'js/[name].[hash].js',
		format: 'es',
		generatedCode: 'es2015',
		hoistTransitiveImports: false, // use <link rel="preload" />.
		manualChunks: (id, { getModuleInfo }) => getModuleInfo(id).isEntry ? null : splitRule(id),
		minifyInternalExports: false,
		plugins: [
			process.env.NODE_ENV === 'production' && minify({
				charset: 'utf8',
				legalComments: 'none',
				treeShaking: true,
			})
		],
		sourcemap: true,
	}
}));
