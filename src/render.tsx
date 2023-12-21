import { createElement, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Container } from 'semantic-ui-react';

import Header from './components/util/Header';

import './styles/main.css';
import './styles/chagpt.css';

function initOptimizeResize() {
	let running = false;
	const handler = function () {
		if (!running) {
			running = true;
			requestAnimationFrame(() => {
				window.dispatchEvent(new CustomEvent('RAFresize'));
				running = false;
			});
		}
	}
	window.addEventListener('resize', handler);
}

export function renderRoot(Component: React.FC) {
	initOptimizeResize();
	createRoot(document.getElementById('root')!).render(
		<StrictMode>
			<Header />
			<Container className="main">
				<Component />
			</Container>
		</StrictMode>
	);
}
