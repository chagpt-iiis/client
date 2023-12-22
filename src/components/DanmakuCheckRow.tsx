import { createElement } from 'react';
import { Button, Table } from 'semantic-ui-react';

import { DanmakuCheck } from '../libs/danmakuCheck';
import { date2str } from '../util/date';

interface DanmakuCheckRowProps {
	readonly danmaku: DanmakuCheck;
	readonly live: number;
	readonly confirm?: (isAccept: boolean) => void;
}

const DanmakuCheckRow: React.FC<DanmakuCheckRowProps> = props => {
	const
		color = props.danmaku.color,
		isLight = ((color >> 24) & 255) + ((color >> 16) & 255) + ((color >> 8) & 255) >= 384,
		colorStr = `#${color.toString(16).padStart(8, '0')}`,
		clazz = isLight ? 'danmaku-light' : undefined;

	return (
		<Table.Row
			positive={props.live > 0}
			negative={props.live < 0}
		>
			<Table.Cell content={props.danmaku.id} />
			<Table.Cell className={clazz} style={{ color: colorStr }} content={props.danmaku.content} title={props.danmaku.content} />
			<Table.Cell content={date2str(new Date(props.danmaku.time))} />
			<Table.Cell className={clazz} style={{ color: colorStr }} content={colorStr} />
			<Table.Cell>
				<Button className="danmaku-check" negative content={props.live < 0 ? `Reject (${-props.live})` : 'Reject'} onClick={() => props.confirm?.(false)} />
				<Button className="danmaku-check" positive content={props.live > 0 ? `Accept (${props.live})` : 'Accept'} onClick={() => props.confirm?.(true)} />
			</Table.Cell>
		</Table.Row>
	);
}

DanmakuCheckRow.displayName = 'DanmakuCheckRow';

export default DanmakuCheckRow;
