import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { createElement, MutableRefObject, useEffect, useRef } from 'react';
import EditorConfig = monaco.editor.IStandaloneEditorConstructionOptions;
import ChangeEvent = monaco.editor.IModelContentChangedEvent;
import EditorType = monaco.editor.ICodeEditor;
import EOLPreference = monaco.editor.EndOfLinePreference;
import IDimension = monaco.editor.IDimension;

import 'monaco-editor/esm/vs/base/browser/ui/codicons/codiconStyles';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution';
import 'monaco-editor/esm/vs/editor/common/standaloneStrings';
import 'monaco-editor/esm/vs/editor/contrib/bracketMatching/browser/bracketMatching';
import 'monaco-editor/esm/vs/editor/contrib/clipboard/browser/clipboard';
import 'monaco-editor/esm/vs/editor/contrib/comment/browser/comment';
import 'monaco-editor/esm/vs/editor/contrib/contextmenu/browser/contextmenu';
import 'monaco-editor/esm/vs/editor/contrib/folding/browser/folding';
import 'monaco-editor/esm/vs/editor/contrib/format/browser/formatActions';
import 'monaco-editor/esm/vs/editor/contrib/hover/browser/hoverContribution';
import 'monaco-editor/esm/vs/editor/contrib/linesOperations/browser/linesOperations';
import 'monaco-editor/esm/vs/editor/contrib/multicursor/browser/multicursor';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess';
import 'monaco-editor/esm/vs/language/css/monaco.contribution';
import 'monaco-editor/esm/vs/language/html/monaco.contribution';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';

import { Loader } from 'semantic-ui-react';
import { PTSDecomposition } from '../../util/string';

import 'editor-worker-url-init';
import './Editor.css';

interface EditorProps {
	readonly config?: EditorConfig;

	readonly language: string;
	readonly onChange?: (value: string, event: ChangeEvent) => void;
	readonly value?: string;
	readonly setValueRef: MutableRefObject<(newValue: string) => void>;

	readonly layoutRef?: MutableRefObject<(dimension?: IDimension, postponeRendering?: boolean) => void>;
}

const editorBasicConfig: EditorConfig = {
	insertSpaces: false,
};

function getEditorConfig(props: EditorProps): EditorConfig {
	return {
		...editorBasicConfig,
		...props.config,
		language: props.language,
		value: (props.value ?? ''),
	};
}

const Editor: React.FC<EditorProps> = props => {
	const div = useRef<HTMLDivElement>(null);

	const editor = useRef<EditorType | null>(null);

	const __prevent_trigger_change_event = useRef<boolean | null>(null);

	const layout = (dimension?: IDimension, postponeRendering?: boolean) => editor.current?.layout(dimension, postponeRendering);

	const setValue = (newValue: string) => {
		if (editor.current) {
			const model = editor.current.getModel();
			if (!model) return;
			const
				value = model.getValue(EOLPreference.TextDefined, false),
				[prefix, suffix] = PTSDecomposition(value, newValue),
				P = model.getPositionAt(prefix),
				S = model.getPositionAt(value.length - suffix),
				range = new monaco.Range(P.lineNumber, P.column, S.lineNumber, S.column);

			__prevent_trigger_change_event.current = true;
			editor.current.pushUndoStop();
			editor.current.executeEdits('', [{
				forceMoveMarkers: true,
				range,
				text: newValue.substring(prefix, newValue.length - suffix)
			}]);
			editor.current.pushUndoStop();
			__prevent_trigger_change_event.current = false;
		}
	}

	useEffect(() => {
		if (div.current) {
			const config = getEditorConfig(props);
			div.current.replaceChildren();
			editor.current = monaco.editor.create(div.current, config);
			const resizer = () => layout();
			window.addEventListener('RAFresize', resizer);
			const subscription = editor.current.onDidChangeModelContent((event) => {
				if (!__prevent_trigger_change_event.current) {
					props.onChange?.(editor.current!.getValue(), event);
				}
			});
			if (props.layoutRef) props.layoutRef.current = layout;
			props.setValueRef.current = setValue;
			return () => {
				window.removeEventListener('RAFresize', resizer);
				editor.current!.dispose();
				editor.current!.getModel()?.dispose();
				subscription.dispose();
			};
		}
	}, []);

	return (
		<div className="editor" ref={div}>
			<div style={{ height: '100%', position: 'relative' }}>
				<Loader active content="编辑器加载中..." />
			</div>
		</div>
	);
}

Editor.displayName = 'Editor';

export default Editor;
