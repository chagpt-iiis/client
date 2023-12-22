import { Emitter } from '@socket.io/component-emitter';
import { ChangeEvent, createElement, useEffect, useRef, useState } from 'react';
import { Button, Divider, Grid, Input, Table } from 'semantic-ui-react';

import Editor from '../components/editor/Editor';
import { DanmakuCheck, DanmakuCheckManager } from '../libs/danmakuCheck';
import { renderRoot } from '../render';
import { checkIntRange } from '../util/nt';
import { socket } from '../util/socket';
import { AsyncFunction, assert } from '../util/type';
import { useStore } from 'zustand';

type CheckFunction = (content: string, color: number) => Promise<number>;

const conn = socket('/chagpt-admin'), api = new Emitter();
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


let checkF: CheckFunction = () => Promise.resolve(0);
try {
	const f = await new AsyncFunction(localStorage.getItem('check-script') ?? '')();
	if (typeof f === 'function') checkF = f;
} catch { }

{ //////// ONLY FOR DEBUG
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const global = globalThis as any;
	global.getCheckFunction = () => checkF;
}


const Manager = new DanmakuCheckManager(conn);
api.on('danmaku', async (raw: DanmakuCheck) => {
	const live = await checkF(raw.content, raw.color);
	if (live === Infinity) { // accept
		conn.engine.send(JSON.stringify({
			type: 'danmaku-checked',
			content: raw.content,
			color: raw.color,
		}));
		return;
	} else if (!checkIntRange(live, -180, 180) || live === 0) { // reject
		return;
	}
	const danmaku = DanmakuCheck.fromRaw(raw, live);
	Manager.insert(danmaku);
});


const admin: React.FC = () => {
	useStore(Manager);

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

	function handleApiRepertoire(data: unknown) {
		repertoire.current = JSON.stringify(data);
		setRepertoire.current(JSON.stringify(data, null, '\t'));
	}

	useEffect(() => {
		api.on('repertoire', handleApiRepertoire);
		return () => {
			api.off('repertoire', handleApiRepertoire);
		}
	}, []);

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
			<Divider />
			<div className="danmaku-check-region">
				<Table textAlign="center" celled compact="very" fixed selectable unstackable>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell content="#" style={{ width: '5rem' }} />
							<Table.HeaderCell content="内容" />
							<Table.HeaderCell content="时间" style={{ width: '11rem' }} />
							<Table.HeaderCell content="颜色" style={{ width: '7.5rem' }} />
							<Table.HeaderCell content="状态" style={{ width: '17rem' }} />
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{Manager.retrieve().map(danmaku => danmaku.render())}
					</Table.Body>
				</Table>
			</div>
		</div>
	);
}

admin.displayName = 'admin';

renderRoot(admin);
