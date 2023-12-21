import { createElement, Fragment, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Input, List, Segment } from 'semantic-ui-react';
import { useStore } from 'zustand';

import { Danmaku, DanmakuManager } from '../libs/danmaku';

const Manager = new DanmakuManager();
setInterval(() => Manager.export(), 20e3);
window.addEventListener('beforeunload', (e) => {
	Manager.export();
	if (Manager.dirty) {
		e.preventDefault(); // leave time to export
	}
});

const templateColors = [
	0x000000, // default
			  // colors are picked from host themes
			  // darker  / normal  / lighter
	0xbf2849, // #bf2849 / #f2bbc7 / #ffe6f0
	0x5b6f7e, // #5b6f7e / #aeaeb2 / #dedee4
	0x23326d, // #23326d / #a0a8e1 / #b8bff5
	0xf15c02, // #f15c02 / #e0967a / #ffb99e
	0x4a2299, // #4a2299 / #a68ed5 / #ebe2fc
	0x733809, // #733809 / #c18c5f / #f2d1b5

	0xf2bbc7,
	0xaeaeb2,
	0xa0a8e1,
	0xe0967a,
	0xa68ed5,
	0xc18c5f,
];

{ //////// ONLY FOR DEBUG
	const global = globalThis as any;
	global.Danmaku = Danmaku;
	global.danmakuManager = Manager;
}

interface DanmakuRegionProps {
	readonly isMobile: boolean;
}

const DanmakuRegion: React.FC<DanmakuRegionProps> = props => {
	useStore(Manager);
	useEffect(Manager.scroll, [Manager.getState()]);

	const [text, setText] = useState('');
	const input = useRef<Input>(null);
	const [color, setColor] = useState(0);
	const inputColor = useRef<HTMLInputElement>(null);
	const [alpha, setAlpha] = useState(255);

	const isLight = ((color >> 16) & 255) + ((color >> 8) & 255) + (color & 255) >= 384;

	function handleChange({ target }: { target: { value: string } }) {
		setText(target.value);
	}

	function handleColorChange({ target }: { target: { value: string } }) {
		setColor(parseInt(target.value.substring(1), 16));
	}

	function handleAlphaChange({ target }: { target: { value: string } }) {
		setAlpha(parseInt(target.value));
	}

	function setColorByTheme(color: number) {
		setColor(color);
		if (inputColor.current) {
			inputColor.current.value = `#${color.toString(16).padStart(6, '0')}`;
		}
	}

	function proposeDanmaku() {
		if (!text.trim()) return;
		Manager.propose(text.trim(), color * 256 + alpha);
		setText('');
		input.current?.focus();
	}

	return (
		<>
			<Segment
				attached="top"
				className={`danmaku-region ${props.isMobile ? 'mobile' : 'desktop'}`}
				ref={(ref: HTMLElement) => {
					Manager.element?.removeEventListener('scrollend', Manager.handleScrollEnd);
					ref?.removeEventListener('scrollend', Manager.handleScrollEnd);
					(Manager.element = ref)?.addEventListener('scrollend', Manager.handleScrollEnd);
				}}
			>
				<List className="danmaku">
					{Manager.retrieve(256).map(danmaku => danmaku.get())}
				</List>
			</Segment>
			<Input
				className="send-danmaku"
				fluid
				action={{
					color: 'pink',
					content: '发送',
					icon: 'send',
					onClick: proposeDanmaku,
				}}
				icon="align left"
				iconPosition="left"
				maxLength={128}
				onChange={handleChange}
				onKeyDown={(e: KeyboardEvent) => {
					if ((e.key === 'Enter' || e.code === 'Enter') && !e.nativeEvent.isComposing) {
						proposeDanmaku();
					}
				}}
				ref={input}
				value={text}
			/>
			<Segment className="no-shadow color-pick">
				<div>
					{templateColors.map((color, idx) => (
						<div
							className="template-color"
							key={idx}
							style={{ backgroundColor: `#${color.toString(16).padStart(6, '0')}` }}
							onClick={() => setColorByTheme(color)}
						/>
					))}
					<div className={isLight ? 'color-demo danmaku-light' : 'color-demo'} style={{ color: `#${color.toString(16).padStart(6, '0')}${alpha.toString(16).padStart(2, '0')}` }}>CháGPT</div>
				</div>
				<div className="color-alpha-controller">
					<div>
						Color:&nbsp;<input type="color" name="color" onChange={handleColorChange} ref={inputColor} />
					</div>
					<div>
						Alpha:&nbsp;<input type="range" name="alpha" min={128} max={255} defaultValue={255} onChange={handleAlphaChange} style={{ flex: 1 }} />
					</div>
				</div>
			</Segment>
		</>
	);
};

DanmakuRegion.displayName = 'Danmaku';

export default DanmakuRegion;
