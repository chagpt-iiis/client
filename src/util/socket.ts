import type { DefaultEventsMap, Emitter as EmitterType } from '@socket.io/component-emitter';
import type { Socket as EngineType } from 'engine.io-client';
import { Manager } from 'socket.io-client';

export const Emitter: typeof EmitterType = Object.getPrototypeOf(Manager);

export const Engine: typeof EngineType = new Manager({
	path: '\0',
	reconnection: false,
	transports: ['websocket'],
}).engine.constructor as typeof EngineType;

export interface ListenEvents extends DefaultEventsMap {
	data: (data: string | ArrayBuffer) => void;
}

/**
 * Make a WebSocket (wrapped by engine.io)
 * @param pathname The socket pathname.
 * @returns The wrapped socket.
 */
export function socket(url: URL): Manager<ListenEvents> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const sock = <any>new Manager({
		addTrailingSlash: url.pathname.endsWith('/'),
		autoConnect: false,
		hostname: url.hostname,
		path: url.pathname,
		port: url.port,
		transports: ['websocket'],
	});
	sock.ondata = function (data: string | ArrayBuffer) { this.emit("data", data); }
	return sock.connect((err?: Error & { code: string }) => {
		if (!err) return;
		if (err.code === 'parser error') return;
		if (err.message === 'websocket error') return;
		if (sock._reconnecting || sock.backoff.attempts) return;
		sock.reconnect();
	});
}
