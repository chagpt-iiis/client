import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { basename, extname, relative } from 'path';
import { defineConfig } from 'rollup';
import esbuild, { minify } from 'rollup-plugin-esbuild';
import externalGlobals from 'rollup-plugin-external-globals';

import { EDITOR_WORKER_URL_INIT, WORKER_MODULE, getRoot, jkmx } from './build.js';

const ROOT = getRoot();

function splitRule(id) {
	if (id === EDITOR_WORKER_URL_INIT)
		return 'monaco';
	const relaPath = relative(ROOT, id);
	switch (relaPath) {
		case 'src/components/Chat.tsx':
		case 'src/components/Danmaku.tsx':
		case 'src/components/Repertoire.tsx':
		case 'src/libs/api.ts':
		case 'src/libs/danmaku.tsx':
			return null;
	}
	if (relaPath.startsWith('src/pages/'))
		return 'entry';
	if (relaPath === 'node_modules/monaco-editor/esm/vs/nls.js' || relaPath === 'node_modules/monaco-editor/esm/vs/nls.messages.js')
		return 'monaco-common';
	if (/^node_modules\/monaco-editor\/esm\/vs\/.+\/common\//.test(relaPath))
		return 'monaco-common';
	if (relaPath.startsWith('node_modules/monaco-editor/'))
		return 'monaco';
	if (relaPath.startsWith('src/components/editor/'))
		return 'monaco';
	return 'libs';
}

export default Promise.resolve().then(() => defineConfig({
	external: id => {
		switch (id) {
			case 'react': return true;
			case 'react-dom/client': return true;
			case 'semantic-ui-react': return true;
			case 'socket.io-client': return 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js';
		}
		return false;
	},
	input: {
		main: './src/pages/main.tsx',
		admin: './src/pages/admin.tsx',
		danmaku: './src/pages/danmaku.ts',
		/******** monaco-editor workers ********/
		'editor.worker': `./node_modules/${WORKER_MODULE.DEFAULT.identifier}`,
		'json.worker': `./node_modules/${WORKER_MODULE.JSON.identifier}`,
		'css.worker': `./node_modules/${WORKER_MODULE.CSS.identifier}`,
		'html.worker': `./node_modules/${WORKER_MODULE.HTML.identifier}`,
		'ts.worker': `./node_modules/${WORKER_MODULE.TS.identifier}`,
		/******** phony (make exports) ********/
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
		entryFileNames: chunkInfo => {
			if (chunkInfo.name.endsWith('.worker')) {
				return `js/workers/${basename(chunkInfo.name, '.worker')}.[hash].js`;
			}
			return 'js/[name].[hash].js';
		},
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
