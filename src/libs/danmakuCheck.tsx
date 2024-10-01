import assert from 'nanoassert';
import { createElement } from 'react';
import type { Manager } from 'socket.io-client';

import DanmakuCheckRow from '../components/DanmakuCheckRow';
import type { ListenEvents } from '../util/socket';

const timer = Symbol(), confirm = Symbol();

export class DanmakuCheck {
	/** The id of the danmaku. */
	id: number;
	/** The content of the danmaku. */
	content: string;
	/** The time when the danmaku is sent. */
	time: number;
	/** The color of the danmaku. */
	color: number;
	/** The check time to live. */
	live: number;
	/** The timer for the check time to live. */
	[timer]?: number;
	/** The callback to confirm the danmaku. */
	[confirm]?: (isAccept: boolean) => void;

	constructor(id: number, content: string, time: number, color: number, live: number) {
		this.id = id;
		this.content = content;
		this.time = time;
		this.color = color;
		this.live = live;
		assert(live !== 0);
	}

	static fromRaw(raw: DanmakuCheck, live: number) {
		return new DanmakuCheck(raw.id, raw.content, raw.time, raw.color, live);
	}

	render() {
		return <DanmakuCheckRow key={this.id} danmaku={this} live={this.live} confirm={this[confirm]} />;
	}
}

declare module 'zustand' {
	function useStore(manager: DanmakuCheckManager): void;
}

export class DanmakuCheckManager {
	data: Record<number, DanmakuCheck>;
	#nonce: number;
	#listeners: Set<() => void>;
	#conn: Manager<ListenEvents>;

	constructor(conn: Manager<ListenEvents>) {
		this.data = [];
		this.#nonce = 0;
		this.#listeners = new Set();
		this.#conn = conn;
		this.#bindThis();
	}

	#bindThis() {
		this.getState = this.getState.bind(this);
		this.subscribe = this.subscribe.bind(this);
		this.destroy = this.destroy.bind(this);
	}

	rerender() {
		++this.#nonce;
		this.#listeners.forEach(listener => listener());
	}

	insert(check: DanmakuCheck) {
		check[timer] = setInterval(this.tick.bind(this), 1000, check);
		check[confirm] = this.submit.bind(this, check);
		this.data[check.id] = check;
		this.rerender();
	}

	retrieve() {
		return Object.values(this.data);
	}

	submit(check: DanmakuCheck, isAccept: boolean) {
		if (check[timer]) clearInterval(check[timer]);
		if (isAccept) {
			this.#conn.engine.send(JSON.stringify({
				type: 'danmaku-checked',
				content: check.content,
				color: check.color,
			}));
		}
		delete this.data[check.id];
		this.rerender();
	}

	tick(check: DanmakuCheck) {
		const isAccept = check.live > 0;
		isAccept ? --check.live : ++check.live;
		if (check.live) {
			this.rerender();
		} else {
			this.submit(check, isAccept);
		}
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
}
