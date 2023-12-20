import { createElement, Fragment } from 'react';
import { Segment } from 'semantic-ui-react';

interface ChatProps {
	readonly isMobile: boolean;
}

const Chat: React.FC<ChatProps> = props => {
	return (
		<>
			<Segment style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }} >
				{props.isMobile.toString()}
				{'\n'}
				{document.body.offsetWidth}
				{'\n'}
				{document.body.offsetHeight}
			</Segment>
		</>
	);
};

Chat.displayName = 'Chat';

export default Chat;
