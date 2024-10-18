import { socket } from '../util/socket';

const emitterSecret = new URLSearchParams(location.search).get('secret');
const root = document.getElementById('root')!;
const sleep = (ms: number) => new Promise(fulfill => setTimeout(fulfill, ms));

const pool = Array.from({ length: 100 }, () => {
	const node = document.createElement('div');
	node.style.bottom = '-24px';
	return node;
});
root.append(...pool);
const alive = new Set<HTMLDivElement>();

const conn = socket(new URL('/danmaku', location.origin));
conn.on('open', () => conn.engine.send(emitterSecret));
conn.on('data', async data => {
	let content: string, color: number;
	try {
		({ content, color } = JSON.parse(<string>data));
	} catch {
		return;
	}

	const colorStr = `#${color.toString(16).padStart(8, '0')}`;
	const node = pool.shift()!;
	pool.push(node);
	node.style.color = colorStr;
	node.textContent = content;
	const dy = node.offsetHeight + 5;
	node.style.bottom = `${-dy}px`;

	alive.add(node);

	for (const node of alive) {
		node.style.bottom = `${parseInt(node.style.bottom) + dy}px`;
	}

	await sleep(20000);
	alive.delete(node);
	node.textContent = '';
	node.style.bottom = '-24px';
});
