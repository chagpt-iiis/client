import { createElement, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Container } from 'semantic-ui-react';

import Header from './components/util/Header';

import './styles/main.css';
import './styles/chagpt.css';

export function renderRoot(Component: React.FC) {
	createRoot(document.getElementById('root')!).render(
		<StrictMode>
			<Header />
			<Container className="main">
				<Component />
			</Container>
		</StrictMode>
	);
}
