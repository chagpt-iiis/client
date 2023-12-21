import { Emitter } from '@socket.io/component-emitter';
import { ChangeEvent, createElement, useRef, useState } from 'react';
import { Divider, Grid, Input } from 'semantic-ui-react';

import { renderRoot } from '../render';
import { socket } from '../util/socket';
import Editor from '../components/editor/Editor';

const conn = socket('/chagpt-admin');

const api = new Emitter();

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

	const setRepertoire = useRef<(newValue: string) => void>(() => {/* initial */ });
	const setCheckCode = useRef<(newValue: string) => void>(() => {/* initial */ });

	api.on('repertoire', (data: unknown) => {
		setRepertoire.current(JSON.stringify(data, null, '\t'));
	});

	function handleRepertoireChange(newValue: string) {
	}

	function handleCheckCodeChange(newValue: string) {
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
				</Grid.Column>
				<Grid.Column width={8}>
					<Editor
						language="javascript"
						onChange={handleCheckCodeChange}
						setValueRef={setCheckCode}
					/>
				</Grid.Column>
			</Grid>
		</div>
	);
}

admin.displayName = 'admin';

renderRoot(admin);
