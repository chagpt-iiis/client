import { Emitter } from '@socket.io/component-emitter';

import { socket } from '../util/socket';

export const conn = socket('/chagpt'), api = new Emitter();
conn.on('data', (data: string | ArrayBuffer) => {
	let json, type;
	try {
		json = JSON.parse(data as string);
		type = json.type;
		delete json.type;
	} catch {
		return;
	}
	api.emit(type, json);
});
