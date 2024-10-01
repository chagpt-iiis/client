import assert from 'nanoassert'
import { createElement, Fragment, useEffect, useRef } from 'react';
import { Table } from 'semantic-ui-react';

import { create, StoreApi, UseBoundStore } from 'zustand';
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

const RepertoireCenter: UseBoundStore<StoreApi<Repertoire>> = create(
	(set, get, api) => {
		assert(api.getState === get);
		assert(api.setState === set);
		return { programs: [], current: 0 };
	}
);

api.on('repertoire', (data: Repertoire) => RepertoireCenter.setState(data));

const RepertoireRegion: React.FC<RepertoireProps> = props => {
	const repertoire = RepertoireCenter();
	const current = useRef<HTMLElement | null>(null);

	useEffect(() => {
		current.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	}, [repertoire]);

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
									ref={(ref: HTMLTableCellElement | null) => {
										if (program.id === repertoire.current) {
											current.current = ref;
										}
									}}
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

RepertoireRegion.displayName = 'Repertoire';

export default RepertoireRegion;
