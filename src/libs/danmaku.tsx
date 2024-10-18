import { openDB } from 'idb';
import { createElement, type ReactNode } from 'react';
import { List } from 'semantic-ui-react';

import { date2str, date2timestr } from '../util/date';
import { api, conn } from './api';

export class Danmaku {
	/** The id of the danmaku. */
	id: number;
	/** The content of the danmaku. */
	content: string;
	/** The time when the danmaku is sent. */
	time: number;
	/** The color of the danmaku. */
	color: number;

	#cachedElement: ReactNode;

	constructor(id: number, content: string, time: number, color: number) {
		this.id = id;
		this.content = content;
		this.time = time;
		this.color = color;
		this.#cachedElement = null;
	}

	static fromRaw(raw: Danmaku) {
		return new Danmaku(raw.id, raw.content, raw.time, raw.color);
	}

	render() {
		const time = new Date(this.time), isLight = ((this.color >> 24) & 255) + ((this.color >> 16) & 255) + ((this.color >> 8) & 255) >= 384;
		return (
			<List.Item
				key={this.id}
				style={{ color: `#${this.color.toString(16).padStart(8, '0')}` }}
			>
				<span className={isLight ? 'danmaku-light' : undefined}>{this.content}</span>
				<span className="danmaku-time prompt" title={date2str(time)}>{date2timestr(time)}</span>
			</List.Item>
		);
	}

	get() {
		return this.#cachedElement ??= this.render();
	}

	export() {
		return {
			id: this.id,
			content: this.content,
			time: this.time,
			color: this.color,
		};
	}
}

function merge(xs: Danmaku[], ys: Danmaku[]) {
	const result: Danmaku[] = [];
	for (let i = 0, j = 0; i < xs.length || j < ys.length;) {
		const cur = j >= ys.length || (i < xs.length && xs[i].id < ys[j].id) ? xs[i++] : ys[j++];
		result.push(cur);
		for (; i < xs.length && xs[i].id === cur.id; ++i);
		for (; j < ys.length && ys[j].id === cur.id; ++j);
	}
	return result;
}

declare module 'zustand' {
	function useStore(manager: DanmakuManager): void;
}

export class DanmakuManager {
	data: Record<number, Danmaku[]>;
	element: HTMLElement | null;
	isBottom: boolean;
	#nonce: number;
	#listeners: Set<() => void>;
	#hack0: boolean;
	dirty: boolean;

	constructor() {
		this.data = {};
		this.element = null;
		this.isBottom = true;
		this.#nonce = 0;
		this.#listeners = new Set();
		this.#hack0 = false;
		this.dirty = false;
		this.#bindThis();
		this.readFromDB();
		api.on('danmaku', (danmaku: Danmaku) => {
			this.insert([Danmaku.fromRaw(danmaku)]);
		});
	}

	#bindThis() {
		this.getState = this.getState.bind(this);
		this.subscribe = this.subscribe.bind(this);
		this.destroy = this.destroy.bind(this);
		this.scroll = this.scroll.bind(this);
		this.handleScrollEnd = this.handleScrollEnd.bind(this);
	}

	rerender() {
		++this.#nonce;
		this.#listeners.forEach(listener => listener());
	}

	insertTo(gid: number, danmakus: Danmaku[]) {
		this.data[gid] = merge(this.data[gid] ?? [], danmakus);
		this.dirty = true;
	}

	insert(danmakus: Danmaku[]) {
		danmakus.sort((x, y) => x.id - y.id);
		for (let i, j = 0; (i = j) < danmakus.length;) {
			const gid = danmakus[i].id >> 10; // block size = 1024
			for (; j < danmakus.length && (danmakus[j].id >> 10) === gid; ++j);
			this.insertTo(gid, danmakus.slice(i, j));
		}
		this.rerender();
	}

	scroll() {
		if (this.isBottom) {
			this.element?.scrollTo({ top: this.element.scrollHeight, behavior: 'smooth' });
			this.#hack0 = true;
		}
	}

	handleScrollEnd() {
		this.isBottom = this.#hack0 || !this.element || this.element.scrollTop + this.element.clientHeight > this.element.scrollHeight - 1;
		this.#hack0 = false;
	}

	async readFromDB() {
		const db = await openDB('cellxx', 1, {
			upgrade(db) {
				if (!db.objectStoreNames.contains('danmaku')) {
					db.createObjectStore('danmaku');
				}
			}
		});
		const os = db.transaction('danmaku').objectStore('danmaku');
		for (const { gid, danmakus } of await os.getAll()) {
			this.insertTo(gid, danmakus.map(Danmaku.fromRaw));
		}
		this.rerender();
	}

	async export() {
		const db = await openDB('cellxx', 1, {
			upgrade(db) {
				if (!db.objectStoreNames.contains('danmaku')) {
					db.createObjectStore('danmaku');
				}
			}
		});
		const os = db.transaction('danmaku', 'readwrite').objectStore('danmaku');
		for (const [gid, danmakus] of Object.entries(this.data)) {
			os.put({
				gid: Number(gid),
				danmakus: danmakus.map(danmaku => danmaku.export()),
			}, gid);
		}
		this.dirty = false;
	}

	retrieve(count: number) {
		const slices: Danmaku[][] = [];
		for (const gid of Object.keys(this.data).reverse()) {
			const data = this.data[Number(gid)];
			if (data.length >= count) {
				slices.push(data.slice(-count));
				break;
			}
			slices.push(data);
			count -= data.length;
		}
		return slices.reverse().flat();
	}


	getState() {
		return this.#nonce;
	}

	subscribe(listener: () => void) {
		this.#listeners.add(listener);
		return () => this.#listeners.delete(listener);
	}

	destroy() {
		this.#listeners.clear();
	}

	propose(content: string, color: number) {
		conn.engine.send(JSON.stringify({
			type: 'propose',
			content,
			color
		}));
	}
}
