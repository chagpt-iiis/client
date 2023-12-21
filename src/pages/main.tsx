import { MouseEvent, createElement, useState } from 'react';
import { Grid, Header, Segment, Tab, TabProps } from 'semantic-ui-react';

// import Chat from '../components/Chat';
import Danmaku from '../components/Danmaku';
import Repertoire from '../components/Repertoire';
import { renderRoot } from '../render';
import { isMobileCenter } from '../util/isMobile';

const main: React.FC = () => {
	const isMobile = isMobileCenter();
	const [signTabActiveIndex, setSignTabActiveIndex] = useState(1);

	const handleTabChange = (_: MouseEvent, { activeIndex }: TabProps) => {
		setSignTabActiveIndex(activeIndex as number);
	};

	const
		repertoire = <Repertoire isMobile={isMobile} />,
		// chat = <Chat isMobile={isMobile} />,
		danmaku = <Danmaku isMobile={isMobile} />;

	return (
		<div className="root-cover">
			{isMobile
				? <Tab
					activeIndex={signTabActiveIndex}
					menu={{ widths: 2 }}
					onTabChange={handleTabChange}
					panes={[
						{ menuItem: '节目单', pane: <Tab.Pane attached={false} key="repertoire">{repertoire}</Tab.Pane> },
						// { menuItem: '聊天', pane: <Tab.Pane attached={false} key="chat">{chat}</Tab.Pane> },
						{ menuItem: '弹幕', pane: <Tab.Pane attached={false} key="danmaku">{danmaku}</Tab.Pane> },
					]}
					renderActiveOnly={false}
				/>
				: <Grid>
					<Grid.Column width={8}>
						<Header
							block
							as="h4"
							content="节目单"
							icon="clipboard list"
							attached="top"
						/>
						<Segment attached="bottom">
							{repertoire}
						</Segment>
					</Grid.Column>
					{/* <Grid.Column width={5}>
						<Header
							block
							as="h4"
							content="聊天"
							icon="comments"
							attached="top"
						/>
						<Segment attached="bottom">
							{chat}
						</Segment>
					</Grid.Column> */}
					<Grid.Column width={8}>
						<Header
							block
							as="h4"
							content="弹幕"
							icon="align left"
							attached="top"
						/>
						<Segment attached="bottom">
							{danmaku}
						</Segment>
					</Grid.Column>
				</Grid>
			}
		</div>
	);
}

main.displayName = 'main';

renderRoot(main);
