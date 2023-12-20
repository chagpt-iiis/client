import type { DefaultEventsMap } from '@socket.io/component-emitter';
import { Manager } from 'socket.io-client';

export interface ListenEvents extends DefaultEventsMap {
	data: (data: string | ArrayBuffer) => void;
}

/**
 * Make a WebSocket (wrapped by engine.io)
 * @param pathname The socket pathname.
 * @returns The wrapped socket.
 */
export function socket(pathname: string): Manager<ListenEvents> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const sock = <any>new Manager({
		addTrailingSlash: pathname.endsWith('/'),
		autoConnect: false,
		path: pathname,
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
