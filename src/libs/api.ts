import { Emitter, socket } from '../util/socket';

export const conn = socket(new URL('/main', location.origin)), api = new Emitter();
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
