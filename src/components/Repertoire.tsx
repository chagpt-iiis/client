import { createElement, Fragment, useState } from 'react';
import { Table } from 'semantic-ui-react';

import { api } from '../libs/api';

interface Program {
	id: number;
	name: string;
	performer: string;
	time: string;
}

interface Repertoire {
	programs: Program[];
	current: number;
}

interface RepertoireProps {
	readonly isMobile: boolean;
}

/*vvvvvvvv DELETE THIS IN RELEASE vvvvvvvv*/
const defaultRepertoire = {
	programs: [
		{ id: 1, name: '人工智能入门', performer: '吴翼 高阳', time: '8:00' },
		{ id: 2, name: '量子计算机科学', performer: '段路明', time: '9:50' },
		{ id: 3, name: '计算理论', performer: '段然', time: '13:30' },
		{ id: 4, name: '这是一个名字很长很长很长很长很长很长很长很长很长的节目', performer: '张三 李四 王五 赵六 孙七 周八 吴九 郑十', time: '18:00' },
		...Array.from({ length: 40 }).map((_, i) => ({
			id: i + 5,
			name: '节目数量很多',
			performer: 'Lorem ipsum',
			time: `18:${i + 10}`,
		})),
	],
	current: 3,
}
/*^^^^^^^^ DELETE THIS IN RELEASE ^^^^^^^^*/

const Repertoire: React.FC<RepertoireProps> = props => {
	const [repertoire, setRepertoire] = useState<Repertoire>(
		// { programs: [], current: 0 }
		defaultRepertoire
	);

	api.on('repertoire', setRepertoire);

	return (
		<>
			<div className={`repertoire ${props.isMobile ? 'mobile' : 'desktop'}`}>
				<Table textAlign="center" celled compact selectable unstackable>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell content="#" />
							<Table.HeaderCell content="名称" />
							<Table.HeaderCell content="人员" />
							<Table.HeaderCell content="时间" />
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{repertoire.programs.map(
							(program) => (
								<Table.Row
									key={program.id}
									active={program.id === repertoire.current}
									positive={program.id < repertoire.current}
								>
									<Table.Cell content={program.id} />
									<Table.Cell content={program.name} />
									<Table.Cell content={program.performer} />
									<Table.Cell content={program.time} />
								</Table.Row>
							)
						)}
					</Table.Body>
				</Table>
			</div>
		</>
	);
};

Repertoire.displayName = 'Repertoire';

export default Repertoire;
