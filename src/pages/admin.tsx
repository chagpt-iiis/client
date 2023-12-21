import { Emitter } from '@socket.io/component-emitter';
import { ChangeEvent, createElement, useRef, useState } from 'react';
import { Button, Divider, Grid, Input } from 'semantic-ui-react';

import { renderRoot } from '../render';
import { socket } from '../util/socket';
import Editor from '../components/editor/Editor';
import { AsyncFunction, assert } from '../util/type';

const conn = socket('/chagpt-admin');

const api = new Emitter();

type CheckFunction = (content: string, color: number) => Promise<boolean>;

let checkF: CheckFunction = () => Promise.resolve(false);

{ //////// ONLY FOR DEBUG
	const global = globalThis as any;
	global.getCheckFunction = () => checkF;
}

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

const admin: React.FC = () => {
	const [adminSecret, setAdminSecret] = useState<string>(localStorage.getItem('admin-secret') ?? '');

	function handleSecretChange(_: ChangeEvent<HTMLInputElement>, { value }: { value: string }) {
		setAdminSecret(value);
		localStorage.setItem('admin-secret', value);
	}

	conn.on('open', () => conn.engine.send(adminSecret));
	const __initialCheckScript = localStorage.getItem('check-script') ?? '';

	const setRepertoire = useRef<(newValue: string) => void>(() => {/* initial */ });
	const setCheckScript = useRef<(newValue: string) => void>(() => {/* initial */ });
	const repertoire = useRef<string>('');
	const checkScript = useRef<string>(__initialCheckScript);

	api.on('repertoire', (data: unknown) => {
		repertoire.current = JSON.stringify(data);
		setRepertoire.current(JSON.stringify(data, null, '\t'));
	});

	function handleRepertoireChange(newValue: string) {
		repertoire.current = newValue;
	}

	function handleCheckScriptChange(newValue: string) {
		checkScript.current = newValue;
		localStorage.setItem('check-script', newValue);
	}

	function updateRepertoire() {
		try {
			const data = JSON.parse(repertoire.current);
			data.type = 'repertoire-update';
			conn.engine.send(JSON.stringify(data));
		} catch (e) {
			console.log(e);
			alert('update repertoire error, see console for information');
		}
	}

	async function updateCheckScript() {
		try {
			const f = await new AsyncFunction(checkScript.current)();
			assert(typeof f === 'function');
			checkF = f;
		} catch (e) {
			console.log(e);
			alert('Update check script error, see console for information');
		}
	}





	return (
		<div className="root-cover">
			<Input
				action={{
					content: '登录',
					onClick: () => conn.engine.send(adminSecret),
				}}
				fluid
				label="密钥"
				onChange={handleSecretChange}
				value={adminSecret}
			/>
			<Divider />
			<Grid>
				<Grid.Column width={8}>
					<Editor
						language="json"
						onChange={handleRepertoireChange}
						setValueRef={setRepertoire}
					/>
					<Button
						content="更新"
						fluid
						onClick={updateRepertoire}
						style={{ marginTop: 10 }}
					/>
				</Grid.Column>
				<Grid.Column width={8}>
					<Editor
						language="javascript"
						onChange={handleCheckScriptChange}
						setValueRef={setCheckScript}
						value={__initialCheckScript}
					/>
					<Button
						content="更新"
						fluid
						onClick={updateCheckScript}
						style={{ marginTop: 10 }}
					/>
				</Grid.Column>
			</Grid>
		</div>
	);
}

admin.displayName = 'admin';

renderRoot(admin);
